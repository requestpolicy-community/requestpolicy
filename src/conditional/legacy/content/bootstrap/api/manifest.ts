/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * RequestPolicy - A Firefox extension for control over cross-site requests.
 * Copyright (c) 2018 Martin Kimmerle
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * ***** END LICENSE BLOCK *****
 */

import { API } from "bootstrap/api/interfaces";
import { Common } from "common/interfaces";
import { MaybePromise } from "lib/classes/maybe-promise";
import { Module } from "lib/classes/module";

export class Manifest extends Module implements API.IManifest {
  public data: any;

  constructor(
      log: Common.ILog,
      private chromeFileService: API.services.IChromeFileService,
  ) {
    super("manifest", log);
  }

  public startupSelf() {
    const manifestUrl = this.chromeFileService.
        getChromeUrl("bootstrap-data/manifest.json");
    const p = this.chromeFileService.parseJSON(manifestUrl).then((data) => {
      this.data = data;
    });
    return MaybePromise.resolve(p);
  }
}
