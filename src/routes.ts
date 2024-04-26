import {Router} from "express";
import {AuthenticatedUser, Register, UpdateInfo} from "./controller/auth.controller";
import {Ambassadors } from "./controller/user.controller";


export const routes = (router: Router) => {
    // Admin

    router.get('/api/admin/ambassadors',  Ambassadors);
    router.put('/api/admin/users/info',  UpdateInfo);
    // admin auth
    router.post('/api/user/admin/register', Register);
    router.get('/api/admin/user',  AuthenticatedUser);
    // auth
    router.post('/api/user/ambassador/register', Register);
    router.get('/api/ambassador/user',  AuthenticatedUser);
    router.put('/api/ambassador/users/info',  UpdateInfo);

}
