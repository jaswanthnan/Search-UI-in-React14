import express from 'express';
import { ObjectId } from 'mongodb';
import { getCandidateCollection } from '../models/Candidate.js';

const router = express.Router();

// Combined Search and Facets
router.get('/facets', async (req, res) => {
  try {
    const collection = await getCandidateCollection();
    const { q } = req.query;

    const getParam = (name) => {
      const val = req.query[name] || req.query[`${name}[]`];
      if (!val) return null;
      return Array.isArray(val) ? val : [val];
    };

    const skillsParams = getParam('skills');
    const statusParams = getParam('status');
    const roleParams = getParam('role');
    const locationParams = getParam('location');

    // 1. Build Search Query for Results
    const query = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { about: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } }
      ];
    }

    if (skillsParams) query.skills = { $in: skillsParams };
    if (statusParams) query.status = { $in: statusParams };
    if (roleParams) query.about = { $in: roleParams };
    if (locationParams) query.location = { $in: locationParams };

    console.log('--- SEARCH REQUEST ---');
    console.log('Raw Query Params:', JSON.stringify(req.query));
    console.log('Generated MongoDB Query:', JSON.stringify(query));

    // 2. Fetch Results
    const data = await collection.find(query).toArray();
    const results = data.map((item, index) => ({
      id: item._id.toString(),
      name: item.name,
      role: item.about || 'Software Engineer',
      email: `${item.name.toLowerCase().replace(' ', '.')}@gmail.com`,
      location: item.location,
      experience: `${item.experience} Years Exp.`,
      skills: item.skills || [],
      status: item.status || 'APPLIED',
      avatarIndex: index % 5
    }));

    // 3. Compute Facets
    const matchQuery = {};
    if (q) {
      matchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { about: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } }
      ];
    }

    const aggregateFacets = async (field) => {
      const pipeline = [{ $match: matchQuery }];
      if (field === 'skills') {
        pipeline.push({ $unwind: '$skills' });
        pipeline.push({ $group: { _id: '$skills', count: { $sum: 1 } } });
      } else {
        const dbField = field === 'role' ? 'about' : field;
        pipeline.push({ $group: { _id: `$${dbField}`, count: { $sum: 1 } } });
      }
      pipeline.push({ $sort: { count: -1 } });
      const res = await collection.aggregate(pipeline).toArray();
      // Format as [{_id, count}] as requested
      return res.map(r => ({ _id: r._id, count: r.count }));
    };

    const [facetSkills, facetStatuses, facetRoles, facetLocations] = await Promise.all([
      aggregateFacets('skills'),
      aggregateFacets('status'),
      aggregateFacets('role'),
      aggregateFacets('location')
    ]);

    // 4. Return combined response with requested facets format
    res.json({
      results,
      skills: facetSkills,
      statuses: facetStatuses,
      roles: facetRoles,
      locations: facetLocations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch search and facets' });
  }
});

// Original base route for compatibility
router.get('/', async (req, res) => {
  res.redirect(307, '/api/data/facets');
});

router.post('/', async (req, res) => {
  try {
    const collection = await getCandidateCollection();
    const newCandidate = {
      name: req.body.name,
      about: req.body.role,
      location: req.body.location,
      experience: Number(req.body.experience),
      skills: req.body.skills || [],
      status: req.body.status || 'APPLIED'
    };

    const result = await collection.insertOne(newCandidate);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add candidate' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const collection = await getCandidateCollection();
    const { id } = req.params;
    const updateData = {
      name: req.body.name,
      about: req.body.role,
      location: req.body.location,
      experience: Number(req.body.experience),
      skills: req.body.skills || [],
      status: req.body.status
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const collection = await getCandidateCollection();
    const { id } = req.params;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

router.post('/bulk-delete', async (req, res) => {
  try {
    const collection = await getCandidateCollection();
    const { ids } = req.body;
    const objectIds = ids.map(id => new ObjectId(id));
    const result = await collection.deleteMany({ _id: { $in: objectIds } });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete candidates' });
  }
});

export default router;
