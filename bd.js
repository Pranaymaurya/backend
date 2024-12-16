import mongoose from 'mongoose';

const bd = () => {
  mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.log(err));
};

export default bd;

