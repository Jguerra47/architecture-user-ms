import {Request, Response} from "express";
import {getConnection, getRepository} from "typeorm";
import {User} from "../entity/user.entity";
import axios from "axios";

export const Register = async (req: Request, res: Response) => {
    const { password, password_confirm, email } = req.body;

    if (password !== password_confirm) {
        return res.status(400).send({
            message: "Password's do not match!"
        })
    }

    const emailUsed = await getRepository(User).find({
            email
    })
    if (emailUsed.length > 0) {
        return res.status(400).send({
            message: "Email already registered"
        })
    }

    const user = await startRegisterTransaction(req)
    if(!user){
        return res.send({
            message: "Internal server error"
        }).status(500);
    }
    res.send(user);
}

async function startRegisterTransaction(req: Request) {
    const {password, first_name, last_name, email} = req.body;
    const queryRunner = getConnection().createQueryRunner();

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const user = new User()
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.is_ambassador = req.path === '/api/user/ambassador/register'

        const userSaved = await queryRunner.manager.save(user);

        await sendToAuthMs(userSaved.id, password, email, userSaved.is_ambassador)

        await queryRunner.commitTransaction();
        return userSaved;
    } catch (e) {
        await queryRunner.rollbackTransaction()
        console.error(e);
        return false;   
    }
}

async function sendToAuthMs(user_id: number, password: string, email: string, is_ambassador: boolean) {
    const userDetailsDTO = {
        user_id,
        password: password,
        email,
        is_ambassador
    }

    await axios.post("http://auth-ms:8000/api/auth/register", userDetailsDTO);
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
    //
    interface order {
        ambassador_revenue: number
    }

    const orderres = await axios.get<order[]>("http://node-ambassador-ms:8000/api/admin/orders", { params: { user_id: user.id } })

    const orders = orderres.data;

    user.revenue = orders.reduce((s, o) => s + o.ambassador_revenue, 0);

    res.send(user);
}


export const UpdateInfo = async (req: Request, res: Response) => {
    const user = req["user"];

    const repository = getRepository(User);

    await repository.update(user.id, req.body);

    res.send(await repository.findOne(user.id));
}
