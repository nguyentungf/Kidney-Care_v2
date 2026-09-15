export function errorHandler(err, req, res, _next) {
  console.error(`[API ERROR] ${req.method} ${req.path}:`, err.message);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Lỗi xử lý máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

