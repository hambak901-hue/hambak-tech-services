import Service from "../models/Service.js";

/* =========================
CREATE SERVICE
========================= */

export const createService = async (req, res) => {

  console.log(req.body);
  console.log(req.file);

  try {

    const slug = req.body.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const existingService =
      await Service.findOne({ slug });

    if (existingService) {

      return res.status(400).json({

        success: false,
        message: "Service already exists"

      });

    }

    const service =
      await Service.create({

        name: req.body.name,

        description: req.body.description,

        category: req.body.category,

        price: req.body.price,

        slug,

        image: req.file
          ? `/uploads/${req.file.filename}`
          : "",

        createdBy: req.user._id

      });

    res.status(201).json({

      success: true,

      message:
        "Service created successfully",

      service

    });

  } catch (error) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};

/* =========================
GET ALL SERVICES
========================= */

export const getServices = async (req, res) => {

  try {

    const services =
      await Service.find()
      .sort({ createdAt: -1 });

    res.status(200).json({

      success: true,
      count: services.length,
      services

    });

  } catch (error) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};

/* =========================
GET SINGLE SERVICE
========================= */

export const getSingleService = async (req, res) => {

  try {

    const service =
      await Service.findById(
        req.params.id
      );

    if (!service) {

      return res.status(404).json({

        success: false,
        message: "Service not found"

      });

    }

    res.status(200).json({

      success: true,
      service

    });

  } catch (error) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};

/* =========================
SEARCH SERVICES
========================= */

export const searchServices = async (req, res) => {

try{

const keyword = req.query.keyword
? {
   $or:[
      {
         name:{
            $regex:req.query.keyword,
            $options:"i"
         }
      },
      {
         category:{
            $regex:req.query.keyword,
            $options:"i"
         }
      },
      {
         description:{
            $regex:req.query.keyword,
            $options:"i"
         }
      }
   ]
}
: {};

const services =
await Service.find(keyword);

res.status(200).json({

success:true,
count:services.length,
services

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

export const updateService = async (req, res) => {

  try {

    if (req.body.name) {

      req.body.slug = req.body.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    }

    if (req.file) {

      req.body.image =
        `/uploads/${req.file.filename}`;

    }

    const service =
      await Service.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
          new: true,
          runValidators: true
        }

      );

    if (!service) {

      return res.status(404).json({

        success: false,
        message: "Service not found"

      });

    }

    res.status(200).json({

      success: true,

      message:
        "Service updated successfully",

      service

    });

  } catch (error) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};

/* =========================
DELETE SERVICE
========================= */

export const deleteService = async (req, res) => {

  try {

    const service =
      await Service.findById(
        req.params.id
      );

    if (!service) {

      return res.status(404).json({

        success: false,
        message: "Service not found"

      });

    }

    await service.deleteOne();

    res.status(200).json({

      success: true,
      message: "Service deleted successfully"

    });

  } catch (error) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};