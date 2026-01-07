// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         error.statusCode = error.statusCode || 500;
//         res.status(error.statusCode).json({ message: error.message });
//     }
// }

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         next(error);
//     }
// }

// const asyncHandler = (requestHandler) =>{
//     return (req,res,next) => {
//         Promise.resolve(requestHandler(req,res,next))
//         .catch((err) => next(err));
//     }
// }

const asyncHandler = (fn) => {
  return function (req, res, next) {
    // console.log("👉 asyncHandler invoked");
    // console.log("   typeof next:", typeof next);

    Promise.resolve(fn(req, res, next))
      .catch((err) => {
        // console.log("👉 error caught in asyncHandler");
        // console.log("   typeof next (catch):", typeof next);
        next(err);
      });
  };
};




export default asyncHandler;