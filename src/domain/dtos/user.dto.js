/**
 * User DTO
 * Data Transfer Object for passing data between layers.
 * Decouples domain entities from external API contracts.
 */
class UserDTO {
    constructor(id, name, email, role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }
}

module.exports = UserDTO;
