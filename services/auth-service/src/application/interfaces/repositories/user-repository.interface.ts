export interface CreateUserData{
    fullName: string;
    email: string;
    passwordHash: string;
}

export interface UserRecord{
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    status: "active" | "suspended" | "pending";
    createdAt: Date;
    updatedAt: Date;
}

export interface UserRepository{
    findByEmail(email:string): Promise<UserRecord | null>;
    findById(id: string): Promise<UserRecord | null>;
    create(data: CreateUserData): Promise<UserRecord>;
}