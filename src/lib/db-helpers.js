import connectDB from './database';

/**
 * Helper function to execute database operations with error handling
 */
export async function withDB(operation, errorMessage = 'Database operation failed') {
  try {
    await connectDB();
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return { 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}

/**
 * Transaction helper for multiple operations
 */
export async function withTransaction(operations, sessionOptions = {}) {
  const session = await mongoose.startSession();
  session.startTransaction(sessionOptions);

  try {
    const results = await operations(session);
    await session.commitTransaction();
    return { success: true, data: results };
  } catch (error) {
    await session.abortTransaction();
    console.error('Transaction failed:', error);
    return { 
      success: false, 
      error: 'Transaction failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  } finally {
    session.endSession();
  }
}

/**
 * Pagination helper
 */
export function paginate(query, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
}

/**
 * Search helper with multiple fields
 */
export function buildSearchFilter(searchTerm, searchFields) {
  if (!searchTerm) return {};
  
  return {
    $or: searchFields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
}