
// MongoDB CRUD operations for Police Management System
import { getDatabase } from './mongodb-connection.js';
import { ObjectId } from 'mongodb';

// Users Collection CRUD
export const UsersCRUD = {
  async create(userData) {
    const db = getDatabase();
    const result = await db.collection('users').insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...userData, _id: result.insertedId };
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
  },

  async findByUsername(username) {
    const db = getDatabase();
    return await db.collection('users').findOne({ username });
  },

  async findByEmail(email) {
    const db = getDatabase();
    return await db.collection('users').findOne({ email });
  },

  async findAll() {
    const db = getDatabase();
    return await db.collection('users').find({}).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Cases Collection CRUD
export const CasesCRUD = {
  async create(caseData) {
    console.log('🔍 Creating case in MongoDB with data:', caseData);
    const db = getDatabase();
    const docToInsert = {
      ...caseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📝 Document to insert:', docToInsert);

    const result = await db.collection('cases').insertOne(docToInsert);
    console.log('✅ Insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('cases').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted case document:', insertedDoc);

    return insertedDoc;
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('cases').findOne({ _id: new ObjectId(id) });
  },

  async findAll() {
    console.log('🔍 Fetching all cases from MongoDB');
    const db = getDatabase();
    const cases = await db.collection('cases').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found cases in MongoDB:', cases.length, 'records');
    return cases;
  },

  async findByStatus(status) {
    const db = getDatabase();
    return await db.collection('cases').find({ status }).toArray();
  },

  async findByOfficer(officerId) {
    const db = getDatabase();
    return await db.collection('cases').find({ assignedOfficer: officerId }).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('cases').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('cases').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Occurrence Book (OB) Entries CRUD
export const OBEntriesCRUD = {
  async create(obData) {
    console.log('🔍 Creating OB entry in MongoDB with data:', obData);
    const db = getDatabase();
    const docToInsert = {
      ...obData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📝 Document to insert:', docToInsert);

    const result = await db.collection('ob_entries').insertOne(docToInsert);
    console.log('✅ Insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('ob_entries').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted OB document:', insertedDoc);

    return insertedDoc;
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('ob_entries').findOne({ _id: new ObjectId(id) });
  },

  async findAll() {
    console.log('🔍 Fetching all OB entries from MongoDB');
    const db = getDatabase();
    const obEntries = await db.collection('ob_entries').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found OB entries in MongoDB:', obEntries.length, 'records');
    return obEntries;
  },

  async findByDateRange(startDate, endDate) {
    const db = getDatabase();
    return await db.collection('ob_entries').find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('ob_entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('ob_entries').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// License Plates CRUD
export const LicensePlatesCRUD = {
  async create(plateData) {
    console.log('🔍 Creating license plate with data:', plateData);
    const db = getDatabase();
    const docToInsert = {
      ...plateData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📝 Document to insert:', docToInsert);

    const result = await db.collection('license_plates').insertOne(docToInsert);
    console.log('✅ Insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('license_plates').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted document:', insertedDoc);

    return {
      ...insertedDoc,
      id: insertedDoc._id.toString()
    };
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('license_plates').findOne({ _id: new ObjectId(id) });
  },

  async findByPlateNumber(plateNumber) {
    const db = getDatabase();
    return await db.collection('license_plates').findOne({ plateNumber });
  },

  async findAll() {
    console.log('🔍 Fetching all license plates from MongoDB');
    const db = getDatabase();
    const plates = await db.collection('license_plates').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found license plates in MongoDB:', plates.length, 'records');
    console.log('📄 Raw plates data:', plates);

    const mappedPlates = plates.map(plate => ({
      ...plate,
      id: plate._id.toString()
    }));
    console.log('🔄 Mapped plates data:', mappedPlates);

    return mappedPlates;
  },

  async findByStatus(status) {
    const db = getDatabase();
    return await db.collection('license_plates').find({ status }).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('license_plates').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('license_plates').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Evidence CRUD
export const EvidenceCRUD = {
  async create(evidenceData) {
    console.log('🔍 Creating evidence in MongoDB with data:', evidenceData);
    const db = getDatabase();
    
    // Generate evidence number if not provided
    const evidenceNumber = evidenceData.evidenceNumber || `EVD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Initialize chain of custody log
    const initialCustodyEntry = {
      action: 'collected',
      officer: evidenceData.collectedBy || 'Unknown Officer',
      timestamp: new Date(),
      notes: 'Initial evidence collection',
      location: evidenceData.location || 'Unknown Location'
    };
    
    const docToInsert = {
      ...evidenceData,
      evidenceNumber,
      custodyLog: [initialCustodyEntry],
      media: evidenceData.media || [],
      tags: evidenceData.tags || [],
      priority: evidenceData.priority || 'Medium',
      condition: evidenceData.condition || 'Good',
      isSealed: evidenceData.isSealed || false,
      bagsSealed: evidenceData.bagsSealed || false,
      photographed: evidenceData.photographed || false,
      fingerprinted: evidenceData.fingerprinted || false,
      dnaCollected: evidenceData.dnaCollected || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Evidence document to insert:', docToInsert);
    
    const result = await db.collection('evidence').insertOne(docToInsert);
    console.log('✅ Evidence insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });
    
    // Return the actual document from database
    const insertedDoc = await db.collection('evidence').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted evidence document:', insertedDoc);
    
    return insertedDoc;
  },

  async findById(id) {
    console.log('🔍 Finding evidence by ID:', id);
    const db = getDatabase();
    const evidence = await db.collection('evidence').findOne({ _id: new ObjectId(id) });
    console.log('📄 Found evidence:', evidence ? 'Yes' : 'No');
    return evidence;
  },

  async findByEvidenceNumber(evidenceNumber) {
    console.log('🔍 Finding evidence by evidence number:', evidenceNumber);
    const db = getDatabase();
    return await db.collection('evidence').findOne({ evidenceNumber });
  },

  async findByCaseId(caseId) {
    console.log('🔍 Finding evidence by case ID:', caseId);
    const db = getDatabase();
    return await db.collection('evidence').find({ caseId }).toArray();
  },

  async findByOBId(obId) {
    console.log('🔍 Finding evidence by OB ID:', obId);
    const db = getDatabase();
    return await db.collection('evidence').find({ obId }).toArray();
  },

  async findAll() {
    console.log('🔍 Fetching all evidence from MongoDB');
    const db = getDatabase();
    const evidence = await db.collection('evidence').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found evidence in MongoDB:', evidence.length, 'records');
    return evidence;
  },

  async findByStatus(status) {
    console.log('🔍 Finding evidence by status:', status);
    const db = getDatabase();
    return await db.collection('evidence').find({ status }).toArray();
  },

  async findByType(type) {
    console.log('🔍 Finding evidence by type:', type);
    const db = getDatabase();
    return await db.collection('evidence').find({ type }).toArray();
  },

  async addCustodyEntry(id, custodyEntry) {
    console.log('🔍 Adding custody entry to evidence:', id, custodyEntry);
    const db = getDatabase();
    const result = await db.collection('evidence').updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { custodyLog: { ...custodyEntry, timestamp: new Date() } },
        $set: { updatedAt: new Date() }
      }
    );
    console.log('📝 Custody entry add result:', { modifiedCount: result.modifiedCount });
    return result.modifiedCount > 0;
  },

  async update(id, updateData) {
    console.log('🔍 Updating evidence:', id, 'with data:', updateData);
    const db = getDatabase();
    
    // Remove fields that shouldn't be directly updated
    const { custodyLog, evidenceNumber, createdAt, ...safeUpdateData } = updateData;
    
    const result = await db.collection('evidence').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...safeUpdateData, updatedAt: new Date() } }
    );
    console.log('📝 Evidence update result:', { modifiedCount: result.modifiedCount });
    return result.modifiedCount > 0;
  },

  async addMedia(id, mediaFile) {
    console.log('🔍 Adding media to evidence:', id, mediaFile);
    const db = getDatabase();
    const result = await db.collection('evidence').updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { media: { ...mediaFile, uploadedAt: new Date() } },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    console.log('🔍 Deleting evidence:', id);
    const db = getDatabase();
    const result = await db.collection('evidence').deleteOne({ _id: new ObjectId(id) });
    console.log('📝 Evidence delete result:', { deletedCount: result.deletedCount });
    return result.deletedCount > 0;
  },

  async getEvidenceStats() {
    console.log('🔍 Getting evidence statistics');
    const db = getDatabase();
    const stats = await db.collection('evidence').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          }
        }
      }
    ]).toArray();
    
    return stats[0] || { total: 0, byStatus: [], byType: [] };
  }
};

// Police Vehicles CRUD
export const PoliceVehiclesCRUD = {
  async create(vehicleData) {
    const db = getDatabase();
    const result = await db.collection('police_vehicles').insertOne({
      ...vehicleData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...vehicleData, _id: result.insertedId };
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('police_vehicles').findOne({ _id: new ObjectId(id) });
  },

  async findByVehicleId(vehicleId) {
    const db = getDatabase();
    return await db.collection('police_vehicles').findOne({ vehicleId });
  },

  async findAll() {
    const db = getDatabase();
    return await db.collection('police_vehicles').find({}).toArray();
  },

  async findByStatus(status) {
    const db = getDatabase();
    return await db.collection('police_vehicles').find({ status }).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('police_vehicles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('police_vehicles').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Profiles Collection CRUD
export const ProfilesCRUD = {
  async create(profileData) {
    console.log('🔍 Creating profile in MongoDB with data:', profileData);
    const db = getDatabase();
    const docToInsert = {
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📝 Profile document to insert:', docToInsert);

    const result = await db.collection('profiles').insertOne(docToInsert);
    console.log('✅ Profile insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('profiles').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted profile document:', insertedDoc);

    return insertedDoc;
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('profiles').findOne({ _id: new ObjectId(id) });
  },

  async findByUserId(userId) {
    const db = getDatabase();
    return await db.collection('profiles').findOne({ userId });
  },

  async findByUsername(username) {
    const db = getDatabase();
    return await db.collection('profiles').findOne({ username });
  },

  async findAll() {
    console.log('🔍 Fetching all profiles from MongoDB');
    const db = getDatabase();
    const profiles = await db.collection('profiles').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found profiles in MongoDB:', profiles.length, 'records');
    return profiles;
  },

  async update(id, updateData) {
    console.log('🔍 Updating profile:', id, 'with data:', updateData);
    const db = getDatabase();
    const result = await db.collection('profiles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    console.log('📝 Profile update result:', { modifiedCount: result.modifiedCount });
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('profiles').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Officers Collection CRUD
export const OfficersCRUD = {
  async create(officerData) {
    console.log('🔍 Creating officer in MongoDB with data:', officerData);
    const db = getDatabase();
    
    // Generate badge number if not provided
    const badgeNumber = officerData.badgeNumber || `OFC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const docToInsert = {
      ...officerData,
      badgeNumber,
      status: officerData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📝 Officer document to insert:', docToInsert);

    const result = await db.collection('officers').insertOne(docToInsert);
    console.log('✅ Officer insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('officers').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted officer document:', insertedDoc);

    return insertedDoc;
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('officers').findOne({ _id: new ObjectId(id) });
  },

  async findByBadgeNumber(badgeNumber) {
    const db = getDatabase();
    return await db.collection('officers').findOne({ badgeNumber });
  },

  async findByDepartment(department) {
    const db = getDatabase();
    return await db.collection('officers').find({ department }).toArray();
  },

  async findAll() {
    console.log('🔍 Fetching all officers from MongoDB');
    const db = getDatabase();
    const officers = await db.collection('officers').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found officers in MongoDB:', officers.length, 'records');
    return officers;
  },

  async update(id, updateData) {
    console.log('🔍 Updating officer:', id, 'with data:', updateData);
    const db = getDatabase();
    const result = await db.collection('officers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    console.log('📝 Officer update result:', { modifiedCount: result.modifiedCount });
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('officers').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Geofiles CRUD
export const GeofilesCRUD = {
  async create(geofileData) {
    const db = getDatabase();
    const result = await db.collection('geofiles').insertOne({
      ...geofileData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...geofileData, _id: result.insertedId };
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('geofiles').findOne({ _id: new ObjectId(id) });
  },

  async findAll() {
    const db = getDatabase();
    return await db.collection('geofiles').find({}).sort({ createdAt: -1 }).toArray();
  },

  async findByType(type) {
    const db = getDatabase();
    return await db.collection('geofiles').find({ type }).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('geofiles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('geofiles').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};
