import passport from "passport";
import passportLocal from "passport-local";
import { Express } from "express";
import { User } from "../models/User";

const LocalStrategy = passportLocal.Strategy;

/**
 * Sign in using Email and Password.
 */
passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        async (email, password, done): Promise<void> => {
            try {
                const user = await User.findOne({ email: email.toLowerCase() });
                if (!user) {
                    return done(null, false, {
                        message: "Email not registered"
                    });
                }

                if (!(await user.authenticate(password))) {
                    return done(null, false, {
                        message: "Invalid credentials"
                    });
                }

                done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Facebook.
 */
// passport.use(new FacebookStrategy({
//     clientID: FACEBOOK_ID,
//     clientSecret: FACEBOOK_SECRET,
//     callbackURL: "/auth/facebook/callback",
//     profileFields: ["name", "email", "link", "locale", "timezone"],
//     passReqToCallback: true
// }, async (req: Request,
//     accessToken: string,
//     refreshToken: string,
//     profile: Profile,
//     done: Function
// ): Promise<void> => {
//     try {
//         if (req.user) {
//             let user = await User.findOne({ facebook: profile.id });
//             if (user) return done(undefined, false, { message: "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
//             user = await User.findById(req.user.id);
//             user.facebook = profile.id;
//             user.tokens.push({ kind: "facebook", accessToken });
//             user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
//             user.profile.gender = user.profile.gender || profile._json.gender;
//             user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
//             await user.save();
//             done(undefined, user);
//         } else {
//             let user = await User.findOne({ facebook: profile.id });
//             if (user) return done(undefined, user);
//             user = await User.findOne({ email: profile._json.email });
//             if (user) return done(undefined, false, { message: "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings." });
//             const newUser: UserDocument = new User();
//             newUser.email = profile._json.email;
//             newUser.facebook = profile.id;
//             newUser.tokens.push({ kind: "facebook", accessToken });
//             newUser.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
//             newUser.profile.gender = profile._json.gender;
//             newUser.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
//             newUser.profile.location = (profile._json.location) ? profile._json.location.name : "";
//             await newUser.save();
//             done(undefined, newUser);
//         }
//     } catch (error) {
//         done(error);
//     }
// }));

export const setupPassport = (app: Express): void => {
    app.use(passport.initialize());
};
