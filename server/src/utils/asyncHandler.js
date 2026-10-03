const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        if (error.isJoi === true) {
            error.statusCode = 422;
        }

        next(error);
    }
};

export { asyncHandler };
