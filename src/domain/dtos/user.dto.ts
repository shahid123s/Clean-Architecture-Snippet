export class UserDTO {
    constructor(
        public readonly id: string | null,
        public readonly name: string,
        public readonly email: string,
        public readonly role: string
    ) { }
}
