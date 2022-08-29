import { Component } from '@angular/core';
import { faAddressBook, faEnvelope, faLink, faPhone } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'grt-address',
    templateUrl: './address.component.html',
    styleUrls: ['./address.component.scss']
})
export class AddressComponent {
    faAddressBook = faAddressBook;
    faEnvelope = faEnvelope;
    faLink = faLink;
    faPhone = faPhone;
}
