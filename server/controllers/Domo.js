const models = require('../models');

const Domo = models.Domo;


const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.render('app', { domos: docs, csrfToken: req.csrfToken() });
  });
};

const makeDomo = (req, res) => {
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'RAWR! Both name and age are required' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    owner: req.session.account._id,
  };

  const newDomo = new Domo.DomoModel(domoData);


  const domoPromise = newDomo.save();

  domoPromise.then(() => res.json({ redirect: '/maker' }));

  domoPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists.' });
    }

    return res.status(400).json({ error: 'An error occured' });
  });

  return domoPromise;
};

const getDomos = (request, response) => {
  const req = request;
  const res = response;

  return Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.json({ domos: docs });
  });
};
const saveDoodle = (request, response) => {
  const req = request;
  const res = response;

  if (!req.body.id || !req.body.img) {
    return res.status(400).json({ error: 'An error occured' });
  }

  const img = req.body.img.replace(/\/\/\//g, '/');

  Domo.DomoModel.findOne({ _id: req.body.id }, 'image', (err, person) => {
    console.log(`orig:${person}`);// "PrevImg:"+
  });
  const domoPromise = Domo.DomoModel.update({ _id: req.body.id }, { image: img });
  console.log(`IMAGE SET TO ${img}`);

  domoPromise.then(() => res.json({ redirect: '/maker' }));

  domoPromise.catch((err) => {
    console.log(err);
    return res.status(400).json({ error: 'An error occured' });
  });

  return domoPromise;
};

module.exports.makerPage = makerPage;
module.exports.getDomos = getDomos;
module.exports.saveDoodle = saveDoodle;
module.exports.make = makeDomo;
