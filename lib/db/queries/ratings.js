import { db, ensureDatabaseInitialized } from '../index.js';
import { ratings } from '../schema.js';
import { eq, desc, sql } from 'drizzle-orm';

/**
 * Insert a new rating and feedback
 */
export async function createRating({ businessId, qrId, rating, feedback }) {
  await ensureDatabaseInitialized();
  if (!businessId || !rating) return null;

  const [created] = await db
    .insert(ratings)
    .values({
      businessId,
      qrId: qrId || null,
      rating,
      feedback: feedback ? feedback.trim() : null,
    })
    .returning();

  return created;
}

/**
 * Get recent feedbacks for a specific business owner
 */
export async function getRecentFeedbacksByBusinessId(businessId, limit = 10) {
  await ensureDatabaseInitialized();
  if (!businessId) return [];

  const results = await db.query.ratings.findMany({
    where: eq(ratings.businessId, businessId),
    orderBy: [desc(ratings.createdAt)],
    limit,
    with: {
      qrCode: true,
    }
  });

  return results || [];
}

/**
 * Get rating metrics (avg, count per star) for a business
 */
export async function getRatingMetricsByBusinessId(businessId) {
  await ensureDatabaseInitialized();
  if (!businessId) return null;

  // We could use db.select() with sql aggregations
  const results = await db
    .select({
      total: sql`count(*)`.mapWith(Number),
      avg: sql`avg(rating)`.mapWith(Number),
      star1: sql`sum(case when rating = 1 then 1 else 0 end)`.mapWith(Number),
      star2: sql`sum(case when rating = 2 then 1 else 0 end)`.mapWith(Number),
      star3: sql`sum(case when rating = 3 then 1 else 0 end)`.mapWith(Number),
      star4: sql`sum(case when rating = 4 then 1 else 0 end)`.mapWith(Number),
      star5: sql`sum(case when rating = 5 then 1 else 0 end)`.mapWith(Number),
    })
    .from(ratings)
    .where(eq(ratings.businessId, businessId));

  return results[0] || {
    total: 0,
    avg: 0,
    star1: 0,
    star2: 0,
    star3: 0,
    star4: 0,
    star5: 0,
  };
}
