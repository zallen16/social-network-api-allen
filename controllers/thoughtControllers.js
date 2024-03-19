const { ObjectId } = require('mongoose').Types;
const { Thought, User } = require('../models');

// Function to get the number of thoughts overall
const postCount = async () => {
    const numberOfThoughts = await Thought.aggregate()
        .count('thoughtCount');
    return numberOfThoughts;
}

module.exports = {
    // get all thoughts
    async getThoughts(req, res) {
        try {
            const thoughts = await Thought.find();

            const thoughtObj = {
                thoughts,
                postCount: await postCount(),
            };

            res.json(thoughtObj);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },

    // get single thought
    async getSingleThought(req, res) {
        try {
            const thought = await Thought.findOne({ _id: req.params.thoughtId })
                .select('-__v');

            if (!thought) {
                return res.status(4040).json({ message: 'No thought with that ID '})
            }
            
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },

    // create a new thought
    async createThought(req, res) {
        try {
            const thought = await Thought.create(req.body);
            res.json(thought);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // delete a thought and remove them from the user
    async deleteThought(req, res) {
        try {
            const thought = await Thought.findOneAndRemove({ _id: req.params.thoughtId });

            if (!thought) {
                return res.status(404).json({ message: 'No such thought exists' });
            }

            const user = await User.findOneAndUpdate(
                { thoughts: req.params.thoughtId },
                { $pull: { thoughts: req.params.thoughtId } },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({
                    message: 'Thought deleted, but no user found',
                });
            }

            res.json({ message: 'Thought successfully deleted' });
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },

    // Add a reaction to a thought
    async addReaction(req, res) {
        console.log('You are adding a reaction');
        console.log(req.body);

        try {
            const thought = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $addToSet: { reactions: req.body } },
                { runValidators: true, new: true }
            );

            if (!thought) {
                return res 
                    .status(404)
                    .json({ message: 'No thought found with that ID!' });
            }

            res.json(thought);
        }   catch (err) {
            res.status(500).json(err);
        }
    },

    // Remove a reaction from a thought
    async removeReaction(req, res) {
        try {
            const thought = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $pull: { reaction: { reactionId: req.params.reactionId } } },
            );

            if (!thought) {
                return res
                .status(404)
                .json({ message: 'No thought found with that ID!' });
            }

            res.json(thought);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};