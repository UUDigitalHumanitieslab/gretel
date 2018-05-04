import { Injectable } from "@angular/core";
import { ClipboardService } from "ngx-clipboard";

@Injectable()
export class ClipboardServiceMock {
    isSupported = true
    isTargetValid(element: HTMLInputElement | HTMLTextAreaElement): boolean {
        return true;
    }
    copyFromInputElement(targetElm: HTMLInputElement | HTMLTextAreaElement): boolean {
        return true;
    }
    copyFromContent(content: string): boolean {
        return true;
    }
    destroy(): void {
    }
}
