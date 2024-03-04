const UserSchema = require("../models/UserSchema");
const jwt = require("jsonwebtoken");


const SignUpController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.json({
        status: false,
        message: "req fields are missing",
        data: null,
      });
      return;
    }
    const objToSend = {
      name,
      email,
      password,
    };

    const emailExistAlready = await UserSchema.findOne({email});
    console.log(emailExistAlready)
    if(emailExistAlready){
        res.json({
            status: false,
            message: "email is already taken",
            data: null,
          });
          return
    }

    const createUser = await UserSchema.create(objToSend);
    if (!createUser) {
      res.json({
        status: false,
        message: "something went wrong on our side",
        data: null,
      });
      return;
    }
    res.json({
      status: true,
      message: "userCreated SucessFully",
      data: createUser,
    });
  } catch (err) {
    res.json({
      status: false,
      message: "something went wrong on our side",
      data: null,
    });
    return;
  }
};

const LoginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.json({
      status: false,
      message: "Required fields are missing",
      data: null,
    });
    return;
  }
  const finduser = await UserSchema.findOne({email});
  console.log(finduser)
  if (!finduser) {
    res.json({
      status: false,
      message: "Either password or email is wrong",
      data: null,
    });
    return;
  }  
  if (!(password===finduser.password)) {
    res.json({
      status: false,
      message: "Either password or email is wrong",
      data: null,
    });
    return;
  }
  const token = jwt.sign({ email: finduser.email }, "PRIVATEKEY",{expiresIn:'85900s'})
  res.json({
    status: true,
    message: "user loged in",
    data: finduser,
    token
  });
};

module.exports = {
  SignUpController,
  LoginController
};
