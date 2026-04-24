import express from 'express';
import { ObjectId } from 'mongodb';
import { getCandidateCollection } from '../models/Candidate.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const collection = await getCandidateCollection();

    const { name } = req.query;

    const query = {};

    if (name) {
      query.$or = [
        { name: { $regex: name, $options: 'i' } },
        { about: { $regex: name, $options: 'i' } },
        { skills: { $regex: name, $options: 'i' } }
      ];
    }

    const data = await collection.find(query).toArray();

    const statuses = ['APPLIED', 'INTERVIEWING', 'REJECTED', 'OFFERED'];

    const mappedData = data.map((item, index) => ({
      id: item._id.toString(),
      name: item.name,
      role: item.about || 'Software Engineer',
      email: `${item.name.toLowerCase().replace(' ', '.')}@gmail.com`,
      location: item.location,
      experience: `${item.experience} Years Exp.`,
      skills: item.skills || [],
      status: item.status || statuses[index % statuses.length],
      avatarIndex: index % 5
    }));

    res.json(mappedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
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
