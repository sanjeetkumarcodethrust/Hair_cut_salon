import Salon from '../models/Salon.js';
import Business from '../models/Business.js';
import User from '../models/User.js';

export const runBusinessMigration = async () => {
  try {
    const salonsWithoutBusiness = await Salon.find({ business: { $exists: false } }).populate('owner');
    
    if (salonsWithoutBusiness.length === 0) return;
    
    console.log(`Found ${salonsWithoutBusiness.length} salons without a Business wrapper. Migrating...`);
    
    // Group salons by owner
    const ownerMap = {};
    for (const salon of salonsWithoutBusiness) {
      if (!salon.owner) continue;
      const ownerId = salon.owner._id.toString();
      if (!ownerMap[ownerId]) {
        ownerMap[ownerId] = { owner: salon.owner, salons: [] };
      }
      ownerMap[ownerId].salons.push(salon);
    }
    
    // Create businesses
    for (const ownerId in ownerMap) {
      const { owner, salons } = ownerMap[ownerId];
      
      const newBusiness = await Business.create({
        name: `${owner.name}'s Business`,
        owner: owner._id,
        description: 'Automatically migrated business',
      });
      
      // Update all their salons to point to this business
      for (const salon of salons) {
        salon.business = newBusiness._id;
        salon.branchName = salon.name; // Use existing salon name as branch name initially
        await salon.save();
      }
      console.log(`Created business for owner ${owner.name} with ${salons.length} branches.`);
    }
    
    console.log('Business migration completed successfully.');
  } catch (error) {
    console.error('Business migration failed:', error);
  }
};
