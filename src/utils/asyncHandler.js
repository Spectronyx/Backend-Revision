const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        error.statusCode = error.statusCode || 500;
        res.status(error.statusCode).json({ message: error.message });
    }
}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         next(error);
//     }
// }

export default asyncHandler;