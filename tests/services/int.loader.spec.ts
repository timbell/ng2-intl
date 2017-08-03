import {Injector} from '@angular/core';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import {
  IntlModule,
  IntlService,
  IntlLoader,
  IntlStaticLoader
} from './../../module';

import {getTestBed, TestBed} from '@angular/core/testing';

// NB tests currently broken - lodash/get in intl.service.ts is undefined. Maybe the same as this: https://github.com/AngularClass/angular-starter/issues/1724

describe('IntlLoader', () => {
    let injector: Injector;
    let translate: IntlService;
    let httpMock: HttpTestingController;

    let prepare = (_injector: Injector) => {
        translate = _injector.get(IntlService);
        httpMock = _injector.get(HttpTestingController);
    };

    it('should be able to provide IntlStaticLoader', () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, IntlModule.forRoot()],
        });
        injector = getTestBed();
        prepare(injector);
        
        expect(translate).toBeDefined();
        expect(translate.currentLoader).toBeDefined();
        expect(translate.currentLoader instanceof IntlStaticLoader).toBeTruthy();

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use('en');

        // this will request the translation from the backend because we use a static files loader for IntlService
        translate.getAsync('TEST').subscribe((res: string) => {
            expect(res).toEqual('This is a test');
        });

        let req = httpMock.expectOne("i18n/en.json");
        
        req.flush({"TEST": "This is a test"});

        httpMock.verify();
    });

    it('should be able to provide any IntlLoader', () => {
        class CustomLoader implements IntlLoader {
            getMessages(lang: string): Observable<any> {
                return Observable.of({'TEST': 'This is a test'});
            }
        }
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, IntlModule.forRoot({provide: IntlLoader, useClass: CustomLoader})],
        });
        injector = getTestBed();
        prepare(injector);

        expect(translate).toBeDefined();
        expect(translate.currentLoader).toBeDefined();
        expect(translate.currentLoader instanceof CustomLoader).toBeTruthy();

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use('en');

        // this will request the translation from the CustomLoader
        translate.getAsync('TEST').subscribe((res: string) => {
            expect(res).toEqual('This is a test');
        });
    });

});

