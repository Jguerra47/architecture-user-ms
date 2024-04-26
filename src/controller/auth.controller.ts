import {Request, Response} from "express";
import {getRepository} from "typeorm";
import {User} from "../entity/user.entity";
import bcryptjs from 'bcryptjs';
import {sign, verify} from "jsonwebtoken";

export const Register = async (req: Request, res: Response) => {
    const {password, password_confirm, ...body} = req.body;

    if (password !== password_confirm) {
        return res.status(400).send({
            message: "Password's do not match!"
        })
    }

    const user = await getRepository(User).save({
        ...body,
        password: await bcryptjs.hash(password, 10),
        is_ambassador: req.path === '/api/ambassador/register'
    });

    delete user.password;

    res.send(user);
}

export const AuthenticatedUser = async (req: Request, res: Response) => {
    const user = req["user"];

    if (req.path === '/api/admin/user') {
        return res.send(user);
    }

    // const orders = await getRepository(Order).find({
    //     where: {
    //         user_id: user.id,
    //         complete: true
    //     },
    //     relations: ['order_items']
    // });

    // TODO: axios get orders

    // user.revenue = orders.reduce((s, o) => s + o.ambassador_revenue, 0);

    res.send(user);
}


export const UpdateInfo = async (req: Request, res: Response) => {
    const user = req["user"];

    const repository = getRepository(User);

    await repository.update(user.id, req.body);

    res.send(await repository.findOne(user.id));
}
