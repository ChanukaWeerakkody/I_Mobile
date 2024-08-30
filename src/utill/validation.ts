import Swal from 'sweetalert2'

export function isValidNIC(nic: string) {
    const nicRegex = /^(([5,6,7,8,9]{1})([0-9]{1})([0,1,2,3,5,6,7,8]{1})([0-9]{6})([v|V|x|X]))|(([1,2]{1})([0,9]{1})([0-9]{2})([0,1,2,3,5,6,7,8]{1})([0-9]{7}))/
    if (!nicRegex.test(nic)) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter the valid NIC number',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        throw new Error("please fill the form")
    }
}

export function isValidPhoneNumber(contactNumber: string) {
    const phoneNumberRegex = /^[0]{1}[7]{1}[01245678]{1}[0-9]{7}$/
    if (!phoneNumberRegex.test(contactNumber)) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter the valid contact number',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        throw new Error("please fill the form")
    }
    return Number.parseInt(contactNumber);
}

export function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter the valid email',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        throw new Error("please fill the form")
    }
}

export function notNullString(value:string){
    const stringValue = value.trim();
    if (!stringValue) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter the valid name',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        throw new Error("please fill the form")
    }
}