//// @ts-ignore // this ignores the error the below line is showing, but it is a bad way to solve the problem
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import z from 'zod';
import bcrypt from 'bcrypt';
import { ContentModel, LinkModel, UserModel } from './db';
import { userMiddleware } from './middleware';
import { random } from './utils';
import cors from 'cors';
const JWT_SECRET = "secret";
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://andyDev:Nikansh%402023@andydev.vkssu.mongodb.net/BrainlyBackend')

app.post('/api/v1/signup', async (req, res) => {
      const requiredBody = z.object({
            username: z.string(),
            password: z.string(),
      })

      const parsedDataWithSuccess = requiredBody.safeParse(req.body);

      if (!parsedDataWithSuccess.success) {
            res.status(400).send(parsedDataWithSuccess.error);
            return;
      }

      const username = req.body.username;
      const password = req.body.password;

      const user = await UserModel.findOne({
            username: username
      })

      if (user) {
            res.status(411).json({
                  message: "User Already Exists"
            })
            return;
      }

      const hashedPassword = await bcrypt.hash(password, 5);

      await UserModel.create({
            username,
            password: hashedPassword,
      })

      res.json({
            message: "User Created Successfully",
      })

})

app.post('/api/v1/login', async (req, res) => {
      const username = req.body.username;
      const password = req.body.password;

      const response = await UserModel.findOne({
            username: username
      })

      if(!response) {
            res.status(400).json({
                  message: "User not found"
            })
            return;
      }

      const isPasswordValid = response && await bcrypt.compare(password, response.password);

      if(!isPasswordValid) {
            res.status(400).json({
                  message: "Invalid Password"
            })
            return;
      }

      const token = jwt.sign({
            id: response._id
      }, JWT_SECRET);

      res.json({
            token: token
      })


})

app.post('/api/v1/content', userMiddleware, async (req, res) => {
      const link = req.body.link;
      const type = req.body.type;
      const x = req.body.x;
      const y = req.body.y;

      await ContentModel.create({
            link,
            title: req.body.title,
            type,
            // @ts-ignore
            userId: req.userId,
            tags: [],
            x: req.body.x,
            y: req.body.y
      })

      res.json({
            message: "Content Created Successfully"
      })

})

app.get('/api/v1/content', userMiddleware, async (req, res) => {
      const userId = req.userId;
      const content = await ContentModel.find({
            userId: userId
      }).populate("userId", "username");
      // this populate function is used to populate the userId field from user Model and since ive written username in the second argument, it will only populate the username field from the user model
      // it will help for the UI to show the username of the user who created the content
      res.json({
            content: content
      })
})

app.delete('/api/v1/content', userMiddleware, async (req, res) => {
      console.log("Received DELETE request with body:", req.body);
      const { contentId, userId } = req.body;

      await ContentModel.findOneAndDelete({
            _id: contentId,
            userId: userId._id
      })

      res.json({
            message: "Content Deleted Successfully"
      })
})

app.patch("/api/v1/content", userMiddleware, async (req, res): Promise<void> => {
      try {
          const { x, y } = req.body; // New x, y positions
          const { contentId, userId } = req.body; // User ID & Content ID

          // Update only x and y fields in the database
          const updatedContent = await ContentModel.findByIdAndUpdate(
              { _id: contentId, userId: userId._id },
              { x, y },  // Only updating these fields
              { new: true } // Returns updated document
          );

          if (!updatedContent) {
             res.status(404).json({ message: "Content not found" });
          }

          res.json({ message: "Position updated successfully", updatedContent });

      } catch (error) {
          res.status(500).json({ message: "Server error", error });
      }
  });


app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
      const share = req.body.share;
      if (share) {
        const existingLink = await LinkModel.findOne({
              userId: req.userId
        });

        if(existingLink) {
              res.json({
                    hash: existingLink.hash
              })
              return;
        }

        const hash = random(10);
            await LinkModel.create({
                  userId: req.userId,
                  hash: hash
            })

            res.json({
                  hash: hash
            })
      } else {
            await LinkModel.deleteOne({
                  userId: req.userId
            })
      }

      res.json({
            message: "Updated Shareable Successfully"
      })
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
      const hash = req.params.shareLink;

      const link = await LinkModel.findOne({
            hash: hash
      })

      if(!link) {
            res.status(404).json({
                  message: "Link not found"
            })
            return;
      }

      const content = await ContentModel.find({
            userId: link.userId
      })

      const user = await UserModel.findOne({
            _id: link.userId
      })

      if(!user) {
            res.status(404).json({
                  message: "User not found"
            })
            return;
      }

      res.json({
            username: user.username,
            content: content
      })
})

app.listen(3000);