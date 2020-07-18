const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query
  let reqQuery = { ...req.query };

  // Field to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over remove fields
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string
  let querytStr = JSON.stringify(reqQuery);

  // create operators (gt gte lte lt in)
  querytStr = querytStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

  query = model.find(JSON.parse(querytStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Select Sort
  if (req.query.sort) {
    const fields = req.query.sort.split(',').join(' ');
    query = query.sort(fields);
  } else {
    query = query.sort('-startDate');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  const results = await query;

  //Pagination Result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
