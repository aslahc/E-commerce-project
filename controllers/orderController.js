const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Cart = require("../models/cartModel");
const Wallet = require("../models/walletModel");
const Address = require("../models/AddressModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Coupon = require("../models/couponModel");
const mongodb = require("mongodb");
const Razorpay = require("razorpay");
const easyinvoice = require("easyinvoice");
const { Readable } = require("stream");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const ExcelJS = require("exceljs");
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const orderCompleteLoad = async (req, res) => {
  try {
    const loggedIn = !!req.session.user_id;
    const categoryData = await Category.find({ is_active: false });
    const { payment, addressId } = req.session.orderData;
    const addressData = await Address.findById({ _id: addressId });

    const user_id = req.session.user_id;

    const cartItems = await Cart.find({ user_id: user_id });

    // Iterate through each item in the cart and update the product stock
    for (const item of cartItems) {
      const product = await Products.findById(item.product_id);

      // Ensure the product exists and has enough stock
      if (product && product.stock >= item.quantity) {
        // Subtract the ordered quantity from the product stock
        product.stock -= item.quantity;

        // Save the updated product information
        await product.save();
      } else {
        // Handle the case where there's not enough stock
        console.error(`Insufficient stock for product: ${item.product_id}`);
        // You might want to consider rolling back the order or taking appropriate action
      }
    }

    const couponCode = req.session.couponCode;
    const coupon = await Coupon.findOne({ code: couponCode });

    if (coupon) {
      const user = await User.findById(req.session.user_id);
      const userId = {
        userId: user._id,
      };
      coupon.used_coupons.push(userId);
      await coupon.save();
    }

    const totalPrice = cartItems.reduce((total, item) => {
      const numericPrice = parseFloat(item.price);
      return isNaN(numericPrice) ? total : total + numericPrice * item.quantity;
    }, 0);

    const products = cartItems.map((item) => ({
      product: item.product_id,
      quantity: item.quantity,
      price: item.quantity * item.price,
      status: "confirmed",
    }));

    const order = new Order({
      user: user_id,
      products,
      payment,
      address: {
        city: addressData.townCity,
        zipCode: addressData.pinCode,
        streetAddress: addressData.addressLine,
      },
      totalPrice,
      status: "pending",
    });

    if (req.session.couponCode) {
      const couponCode = req.session.couponCode;
      const coupon = await Coupon.findOne({ code: couponCode });

      if (coupon) {
        const user = await User.findById(req.session.user_id);
        const userId = {
          userId: user._id,
        };
        coupon.used_coupons.push(userId);
        await coupon.save();
      }
    }

    const deleted = await Cart.deleteMany({ user_id: user_id });

    const orderDb = await order.save();

    res.render("ordercomplete", {
      loggedIn,
      category: categoryData,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const orderComplete = async (req, res) => {
  try {
    const { payment, addressId, totalAmount } = req.body;

    req.session.orderData = { payment, addressId };

    const user_id = req.session.user_id;

    const user = await User.findById(user_id);

    const cartItems = await Cart.find({ user_id: user_id });

    const totalPrice = cartItems.reduce((total, item) => {
      const numericPrice = parseFloat(item.price);
      return isNaN(numericPrice) ? total : total + numericPrice * item.quantity;
    }, 0);

    const products = cartItems.map((item) => ({
      product: item.product_id,
      quantity: item.quantity,
      price: item.quantity * item.price,
      status: "confirmed",
    }));

    const order = new Order({
      user: user_id,
      products,
      payment,
      address: addressId,
      totalPrice: totalAmount * 100,
      status: "pending",
    });

    if (payment === "cod") {
      res.json({
        payment: false,
        method: "cod",
        // order: orderDb,
        orderId: user,
      });
    } else if (payment === "razorPay") {
      const generatedOrder = await generateOrderRazorpay(
        order._id,
        order.totalPrice
      );
      res.json({
        payment: false,
        method: "online",
        razorpayOrder: generatedOrder,
        // order: orderDb,
        orderId: user,
      });
    } else if (payment === "wallet") {
      const wallet = await Wallet.findOne({ user_id: user._id });

      if (!wallet || wallet.balance < totalAmount) {
        // If insufficient balance, return an error response

        return res.status(400).json({ error: "Insufficient wallet balance" });
      }

      wallet.balance -= totalAmount;
      wallet.transactions.push({
        amount: totalAmount,
        reason: "order",
        transactionType: "debit",
        date: new Date().toISOString(),
      });

      // Save the updated wallet
      await wallet.save();

      res.json({
        payment: false,
        method: "wallet",
        // order: orderDb,
        orderId: user,
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateOrderRazorpay = (orderId, total) => {
  return new Promise((resolve, reject) => {
    const options = {
      amount: total,
      currency: "INR",
      receipt: String(orderId),
    };
    instance.orders.create(options, (err, order) => {
      if (err) {
        console.error("Failed to generate Razorpay order");
        reject(err);
      } else {
        resolve(order);
      }
    });
  });
};

const orderDetails = async (req, res) => {
  try {
    const orderId = req.query.id;
    const user_id = req.session.user_id;
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });

    const userData = await User.findById(user_id);

    // Populate the products field with the details from the Products collection
    const orderData = await Order.findOne({ _id: orderId, user: user_id })
      .populate({
        path: "products.product",
        model: "Products", // The name of the referenced model
      })
      .populate("address");

    // Check if orderData is null or undefined before accessing its properties
    if (!orderData) {
      console.error("Order not found");
      return res.status(404).send("Order not found");
    }

    // Iterate over the products array to access the populated "product" field
    const populatedProducts = orderData.products.map(
      (product) => product.product
    );

    res.render("ordersdetail", {
      loggedIn,
      category: categoryData,
      user: userData,
      order: orderData.toObject(),
      products: populatedProducts,
    });
  } catch (error) {
    console.error("Error in orderDetails:", error);
    res.status(500).send("Internal Server Error");
  }
};
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const pId = req.params.pId;
    const userId = req.session.user_id;

    // Find the order and retrieve the refundable product
    const refund = await Order.findOne({
      _id: orderId,
      "products.product": pId,
    });

    if (!refund || !refund.products || refund.products.length === 0) {
      return res.status(404).send("Order or product not found.");
    }

    // Update the order status
    const updatedOrder = await Order.updateOne(
      { _id: orderId, "products.product": pId },
      { $set: { "products.$[elem].status": "Cancelled" } },
      { arrayFilters: [{ "elem.product": pId }] }
    );

    const refundAmount = refund.products[0].price; // Access the first element of the products array

    if (updatedOrder) {
      const userWallet = await Wallet.findOne({ user_id: userId });

      if (userWallet) {
        // Update user's wallet balance
        userWallet.balance += refundAmount;
        await userWallet.save();

        // Save transaction history
        userWallet.transactions.push({
          amount: refundAmount,
          reason: "refund",
          transactionType: "credit",
          date: new Date().toISOString(),
        });

        await userWallet.save();
      } else {
        // Create a new wallet for the user
        const wallet = new Wallet({
          user_id: userId,
          balance: refundAmount,
          transactions: [
            {
              amount: refundAmount,
              reason: "refund",
              transactionType: "credit",

              date: new Date().toISOString(),
            },
          ],
        });

        await wallet.save();
      }
    }

    res.status(200).redirect(`/orderDetails?id=${orderId}`);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
};

const adminOrderManagement = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user")
      .sort({ createdOn: -1 });

    res.status(200).render("adminOrders", {
      title: "Admin Orders",
      orders,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};

const adminOrderDetails = async (req, res) => {
  try {
    const orderId = req.query.id;
    const user_id = req.session.user_id;

    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });
    const userData = await User.findById(user_id);
    // Populate the products field with the details from the Products collection
    const orderData = await Order.findOne({ _id: orderId })
      .populate({
        path: "products.product",
        model: "Products", // The name of the referenced model
      })
      .populate("address")
      .populate("user");

    // Check if orderData is null or undefined before accessing its properties
    if (!orderData) {
      console.error("Order not found");
      return res.status(404).send("Order not found");
    }

    // Iterate over the products array to access the populated "product" field
    const populatedProducts = orderData.products.map(
      (product) => product.product
    );

    res.render("admin-orders-details", {
      loggedIn,
      category: categoryData,
      user: userData,
      order: orderData.toObject(),
      products: populatedProducts,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};

const adminCancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const pId = req.params.pId;
 console.log("entering ")
    // Update p  croduct status
    console.log(pId)
    console.log(orderId)
    const updatedOrder  = await Order.updateOne(
      { _id: orderId, "products.product": pId },
      { $set: { "products.$[elem].status": "Cancelled" } },
      { arrayFilters: [{ "elem.product": pId }] }
    );
   console.log(updatedOrder) 
   if(updatedOrder )   {
    updatedOrder.save()
   }
    // Find the updated order
    const order = await Order.findOne({ _id: orderId, "products.product": pId });

    if (order) {
      // Check if all products are cancelled
      const allProductsCancelled = order.products.every(product => product.status === "Cancelled");

      if (allProductsCancelled) {
        // Update order status and save
        order.status = "Cancelled";
        await Order.save();
      }
    }

    if (updatedOrder) {
      // Redirect after successful cancellation
      res.status(200).redirect(`/admin/order-details?id=${orderId}`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};


const adminStatusChange = async (req, res) => {
  try {
    const id = req.query.id;
    const orderStatus = req.body.orderStatus;

    const orderData = await Order.findById({ _id: id });
    
    orderData.status = orderStatus;

    const changeProductsOrder = orderData.products.forEach((product) => {
      product.status = orderStatus;
    });

    const statusUpdated = await orderData.save();
    if (statusUpdated) {
      res.status(200).redirect("/admin/orderDetails");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};

const invoice = async (req, res) => {
  try {
    const orderId = req.query.id;

    const user_id = req.session.user_id;
    const loggedIn = req.session.user_id ? true : false;
    const categoryData = await Category.find({ is_active: false });

    const userData = await User.findById(user_id);

    const orderData = await Order.findOne({ _id: orderId, user: user_id })
      .populate({
        path: "products.product",
        model: "Products", // The name of the referenced model
      })
      .populate("address");

    // Check if orderData is null or undefined before accessing its properties
    if (!orderData) {
      console.error("Order not found");
      return res.status(404).send("Order not found");
    }

    // Iterate over the products array to access the populated "product" field
    const populatedProducts = orderData.products.map(
      (product) => product.product
    );

    res.render("invoice", {
      loggedIn,
      category: categoryData,
      user: userData,
      order: orderData.toObject(),
      products: populatedProducts,
    });
  } catch (error) {
    res.status(500);
  }
};

const saveInvoice = async (req, res) => {
  try {
    const orderId = req.query.id;

    const userId = req.session.user_id;

    // Fetch the order details with product and address information
    const order = await Order.findById(orderId)
      .populate({
        path: "products.product",
        model: "Products",
      })
      .populate("address");

    // Fetch user details
    const user = await User.findById(userId);

    // Extract relevant information from the order
    const invoiceData = {
      id: orderId,
      total: order.products[0].product.salePrice, // Assuming there's only one product in the order
      date: order.createdOn.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      paymentMethod: order.payment,
      orderStatus: order.status,
      name: order.address.fullName,
      number: order.address.mobile,
      house: order.address.addressLine,
      pincode: order.address.pinCode,
      town: order.address.townCity,
      state: order.address.state,
      products: order.products.map((product) => ({
        quantity: product.quantity,
        description: product.product.productName,
        price: product.price,
        total: product.price * product.quantity,
        "tax-rate": 0,
      })),
      sender: {
        company: "FLOCK",
        address: "Feel your Style",
        city: "kochi",
        country: "India",
      },
      client: {
        company: "Customer Address",
        zip: order.address.pinCode, // Using pinCode as zip
        city: order.address.townCity,
        address: order.address.addressLine,
        // "custom1": "custom value 1",
        // "custom2": "custom value 2",
        // "custom3": "custom value 3"
      },
      information: {
        number: "order" + order.id,
        date: order.createdOn.toLocaleDateString,
      },
      "bottom-notice": "Happy shopping and visit flock clothing store again",
    };

    // Generate PDF using easyinvoice
    const pdfResult = await easyinvoice.createInvoice({
      ...invoiceData,
      bottomNotice: "Happy shopping and visit flock again",
    });
    const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");

    // Set HTTP headers for the PDF response
    res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
    res.setHeader("Content-Type", "application/pdf");

    // Create a readable stream from the PDF buffer and pipe it to the response
    const pdfStream = new Readable();
    pdfStream.push(pdfBuffer);
    pdfStream.push(null);

    pdfStream.pipe(res);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

const saleReportPage = async (req, res) => {
  try {
    const { date } = req.query;
    console.log('Received Date:', date);
    let query = { status: "delivered" };

    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
    
      // Correct the field to 'createdOn' for date filtering
      query.createdOn = { $gte: startDate, $lt: endDate };
      console.log(query);
    }

    const deliveredOrders = await Order.find(query)
      .populate("user")
      .populate("products.product")
      .sort({ createdOn: -1 });

    res.render("saleReport", { orders: deliveredOrders, date });
  } catch (error) {
    console.error("Error in saleReportPage:", error);
    res.status(500).send("Internal Server Error. Please try again later.");
  }
};



const downloadPdf = async (req, res) => {
  try {
    const { date } = req.query;
    let query = { status: "delivered" };
    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
    
      // Correct the field to 'createdOn' for date filtering
      query.createdOn = { $gte: startDate, $lt: endDate };
      console.log(query);
    }
    // Fetch delivered orders from the database
    const deliveredOrders = await Order.find(query)
    .populate("user")
    .populate("products.product")
    .sort({ createdOn: -1 });

    const doc = new PDFDocument();

    // Set the Content-Type header to display the PDF in the browser
    res.setHeader("Content-Type", "application/pdf");
    // Set Content-Disposition to suggest a filename
    res.setHeader("Content-Disposition", 'inline; filename="sale_report.pdf"');
    // Pipe the PDF content to the response stream
    doc.pipe(res);

    // Add content to the PDF (based on your sale report structure)
    doc.text("Sale Report", { fontSize: 17, underline: true }).moveDown();
    doc
      .fontSize(22)
      .text("flock", { align: "center" })
      .text("feel your style ", { align: "center" })
      .text("kochi", { align: "center" })
      .text("india", { align: "center" });

    const rowHeight = 20; // You can adjust this value based on your preference

    // Calculate the vertical position for each line of text in the row
    const yPos = doc.y + rowHeight / 2;

    // Create a table header
    doc
      .fontSize(12)
      .rect(50, doc.y, 750, rowHeight) // Set a rectangle for each row
      .text("Order ID", 50, yPos)
      .text("Date", 190, yPos)
      .text("Customer", 250, yPos)
      .text("Product Name", 310, yPos) // Added product name to the heading
      .text("Quantity", 400, yPos)
      .text("Total", 450, yPos)
      .text("Status", 480, yPos)
      .text("Payment", 550, yPos);
    doc.moveDown();

    // Loop through fetched orders and products
    for (const order of deliveredOrders) {
      for (let j = 0; j < order.products.length; j++) {
        const currentProduct = order.products[j].product;

        // Set a fixed height for each row
        const rowHeight = 20; // You can adjust this value based on your preference

        // Calculate the vertical position for each line of text in the row
        const yPos = doc.y + rowHeight / 2;

        // Add the sale report details to the PDF table
        doc
          .fontSize(10)
          .rect(50, doc.y, 750, rowHeight) // Set a rectangle for each row
          .stroke() // Draw the rectangle
          .text(order._id.toString(), 50, yPos)
          .text(order.createdOn.toISOString().split("T")[0], 190, yPos)
          .text(order.user ? order.user.name : "User not available", 250, yPos)
          .text(
            currentProduct
              ? currentProduct.productName
              : "Product not available",
            310,
            yPos
          ) // Add product name
          .text(order.products[j].quantity.toString(), 400, yPos)
          .text(order.totalPrice.toString(), 450, yPos)
          .text("Delivered", 480, yPos)
          .text(order.payment, 550, yPos);

        // Move to the next row
        doc.moveDown();
      }
      // Add a separator between rows
    }

    // End the document
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const downloadExcel = async (req, res) => {
  try {
    const { date } = req.query;
    let query = { status: "delivered" };

    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
    
      // Correct the field to 'createdOn' for date filtering
      query.createdOn = { $gte: startDate, $lt: endDate };
      console.log(query);
    }
    const orders = await Order.find(query)
    .populate("user")
    .populate("products.product")
    .exec();

    // Fetch your sale report data from MongoDB, similar to what you're doing for the PDF download
    

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sale Report");

    // Add headers to the worksheet with Product Name
    worksheet.addRow([
      "Order ID",
      "Date",
      "Customer",
      "Product Name",
      "Quantity",
      "Total",
      "Status",
      "Payment Method",
    ]);

    // Add data to the worksheet
    orders.forEach((order) => {
      order.products.forEach((product) => {
        worksheet.addRow([
          order._id,
          order.createdOn.toISOString().split("T")[0],
          order.user ? order.user.name : "User not available",
          product.product
            ? product.product.productName
            : "Product not available",
          product.quantity,
          order.totalPrice,
          "Delivered", // Assuming a static status for simplicity
          order.payment,
        ]);
      });
    });

    // Set headers for the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sale_report.xlsx"
    );

    // Write the Excel workbook to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();
  } catch (error) {
    console.error("Error downloading Excel:", error);
    res.status(500).send("Internal Server Error");
  }
};



/// SALE CHART
// SALE CHART
// SALE CHART
const saleChart = async (req, res) => {
  try {
    if (!req.query.interval) {
      console.error("Error: Missing interval parameter in the request");
      return res.status(400).json({ error: "Missing interval parameter" });
    }

    const interval = req.query.interval.toLowerCase();

    let dateFormat, groupByFormat;

    switch (interval) {
      case "yearly":
        dateFormat = "%Y";
        groupByFormat = { $dateToString: { format: "%Y", date: "$createdOn" } };
        break;
      case "monthly":
        dateFormat = "%B %Y";
        groupByFormat = {
          $dateToString: { format: "%B %Y", date: "$createdOn" },
        };
        break;
      case "daily":
        dateFormat = "%Y-%m-%d";
        groupByFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdOn" },
        };
        break;
      default:
        console.error("Error: Invalid time interval");
        return res.status(400).json({ error: "Invalid time interval" });
    }

    const salesData = await Order.aggregate([
      {
        $group: {
          _id: groupByFormat,
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const labels = salesData.map((item) => item._id);
    const values = salesData.map((item) => item.totalSales);
    console.log(labels, values);

    res.json({ labels, values });
  } catch (error) {
    console.error("Internal Server Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  orderComplete,
  orderCompleteLoad,
  adminOrderManagement,
  orderDetails,
  cancelOrder,
  adminOrderDetails,
  adminCancelOrder,
  adminStatusChange,
  invoice,
  saveInvoice,
  saleReportPage,
  downloadPdf,
  downloadExcel,
  saleChart,
};
