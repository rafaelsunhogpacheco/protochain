export default class Validation {
    success: boolean;
    message: string;

    constructor(success: boolean = true, message: string = "") {
        this.success = success;
        this.message = message;
    }
}