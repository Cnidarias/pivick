import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class Config {
  private activatedRoute = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  private _localeSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    "en",
  );
  public locale$ = this._localeSubject.asObservable();
  public locale = this._localeSubject.getValue();

  constructor() {
    this.translate.addLangs(["de", "en"]);
    this.translate.setFallbackLang("en");
    this.translate.use("en");

    this.activatedRoute.queryParams.subscribe((params) => {
      const lang = params["locale"];
      if (lang && this.translate.getLangs().includes(lang)) {
        this.translate.use(lang);
        // Update the locale subject to notify subscribers
        this._localeSubject.next(lang);
        this.locale = this._localeSubject.getValue();
      }
    });
  }
}
