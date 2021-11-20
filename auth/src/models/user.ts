import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describe the properties
// that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties
// that a User Model (collection) has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has.
// We add additional properties on top of properties
// that a mongoose doc is supposed to have.
// Provides type checking on the return of the build function.
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // * JSON.stringify()
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password; //* removing keyword password form the ret object
        delete ret.__v;
      },
    },
  }
);

// Using the 'function' keyword as opposed to the '=>'
// because '=>' would override this to the context of this file.
// we need the default this which points the current user document
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// Static function
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
