const Sauce = require('../models/Sauce');
const fs = require('fs');
const { json } = require('express');

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getSauceById = (req, res, next) => {
    Sauce.findOne({
      _id: req.params.id
    }).then(
      (sauce) => {
        res.status(200).json(sauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.likeSauce = (req, res, next) => {
  const {userId, like} = req.body;

  Sauce.findOne({
    _id: req.params.id
  }).then(sauce => {
      if ( !sauce.usersLiked.includes(userId) && like === 1){
        Sauce.updateOne({ _id: req.params.id },  {
          $inc:{ likes: like },
          $push:{ usersLiked:userId } 
        })
        .then(() => res.status(200).json({ message: 'like +1 !'}))
        .catch(error => res.status(400).json({ error }));

      }else if ( sauce.usersLiked.includes(userId) && like === 0 ) {
        Sauce.updateOne({ _id: req.params.id },  {
          $inc:{ likes: -1 },
          $pull:{ usersLiked: userId } 
        })
        .then(() => res.status(200).json({ message: 'like 0 !'}))
        .catch(error => res.status(400).json({ error }));
      }
      
      if ( !sauce.usersDisliked.includes(userId) && like === -1 ){
        Sauce.updateOne({ _id: req.params.id },  {
          $inc:{ dislikes: -like },
          $push:{ usersDisliked: userId } 
        })
        .then(() => res.status(200).json({ message: 'dislike -1 !'}))
        .catch(error => res.status(400).json({ error }));

      }else if ( sauce.usersDisliked.includes(userId) && like === 0 ) {
        Sauce.updateOne({ _id: req.params.id },  {
          $inc:{ dislikes: -1 },
          $pull:{ usersDisliked: userId } 
        })
        .then(() => res.status(200).json({ message: 'dislike 0 !'}))
        .catch(error => res.status(400).json({ error }));

      }
  })
  .catch( error => {
    res.status(500).json({ error });
  });
}

exports.likeSauce2 = (req, res, next) => {
  const {userId, like} = req.body;
  const userParams = [ 'likes', 'usersLiked', 'dislikes', 'usersDisliked' ];
  let modifTab = '$push', number = 1, userLike, userTab ;
  
  Sauce.findOne({
    _id: req.params.id
  }).then(sauce => {
      switch (like) {
        case 0: {
          modifTab = '$pull';
          number = -1;
          if (sauce.usersLiked.includes(userId)) {
            userLike = userParams[0];
            userTab = userParams[1];
          }else {
            userLike = userParams[2];
            userTab = userParams[3];
          }
          break;
        }
        case 1: {
          if (!sauce.usersLiked.includes(userId)) {
            userLike = userParams[0];
            userTab = userParams[1];
          }
          break;
        }
        case -1: {
          if (!sauce.usersDisliked.includes(userId)) {
            userLike = userParams[2];
            userTab = userParams[3];
          }
          break;
        }
        default: {
          res.status(400).json({ error });
          break;
        }
      }
      
      Sauce.updateOne({ _id: req.params.id }, {
        $inc: { [userLike]: number },
        [modifTab] : { [userTab]: userId }
      })
      .then(() => res.status(200).json({ message: 'Ok'}))
      .catch(error => res.status(400).json({ error }));
  })
  .catch( error => {
    res.status(500).json({ error });
  });
}


