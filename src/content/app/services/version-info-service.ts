/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * RequestPolicy - A Firefox extension for control over cross-site requests.
 * Copyright (c) 2011 Justin Samuel
 * Copyright (c) 2014 Martin Kimmerle
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

import { IVersionComparator } from "app/interfaces";
import { Storage } from "app/storage/storage.module";
import { Module } from "lib/classes/module";
import * as JSUtils from "lib/utils/js-utils";
import { Log } from "models/log";

interface IInfos {
  curAppVersion: string;
  curRPVersion: string;
  isRPUpgrade: boolean;
  lastAppVersion: string;
  lastRPVersion: string;
}
interface IOptionalInfos {
  curAppVersion?: IInfos["curAppVersion"];
  curRPVersion?: IInfos["curRPVersion"];
  isRPUpgrade?: IInfos["isRPUpgrade"];
  lastAppVersion?: IInfos["lastAppVersion"];
  lastRPVersion?: IInfos["lastRPVersion"];
}
interface IInfoPromises {
  curAppVersion?: Promise<IInfos["curAppVersion"]>;
  curRPVersion?: Promise<IInfos["curRPVersion"]>;
  isRPUpgrade?: Promise<IInfos["isRPUpgrade"]>;
  lastAppVersion?: Promise<IInfos["lastAppVersion"]>;
  lastRPVersion?: Promise<IInfos["lastRPVersion"]>;
}

// =============================================================================
// VersionInfos
// =============================================================================

export class VersionInfoService extends Module {
  public get curAppVersion() { return this.infos.curAppVersion; }
  public get curRPVersion() { return this.infos.curRPVersion; }
  public get isRPUpgrade() { return this.infos.isRPUpgrade; }
  public get lastAppVersion() { return this.infos.lastAppVersion; }
  public get lastRPVersion() { return this.infos.lastRPVersion; }

  private infos: IInfos;

  constructor(
      log: Log,
      private versionComparator: IVersionComparator,
      private storage: Storage,
  ) {
    super("app.services.versionInfo", log);
  }

  protected get startupPreconditions() {
    return [
      this.storage.whenReady,
    ];
  }

  protected startupSelf(): Promise<void> {
    const promises: IInfoPromises = {};

    const checkPromise = (aPropName: keyof IInfoPromises) => {
      (promises[aPropName] as Promise<any>).catch((e) => {
        this.log.error(`Error initializing "${aPropName}":`, e);
      });
    };

    const infos: IOptionalInfos = {};

    // -------------------------------------------------------------------------
    // RP version info
    // -------------------------------------------------------------------------

    promises.lastRPVersion =
        browser.storage.local.get("lastVersion").
        then((result) => {
          infos.lastRPVersion = result.lastRPVersion as IInfos["lastRPVersion"];
          return infos.lastRPVersion;
        });
    checkPromise("lastRPVersion");

    promises.isRPUpgrade =
        promises.lastRPVersion.
        then((lastRPVersion) => {
          // Compare with version 1.0.0a8 since that version introduced
          // the "welcome window".
          infos.isRPUpgrade = !!lastRPVersion &&
              this.versionComparator.compare(lastRPVersion, "1.0.0a8") <= 0;
          return infos.isRPUpgrade;
        });
    checkPromise("isRPUpgrade");

    promises.curRPVersion =
        browser.management.getSelf().
        then((addon) => {
          infos.curRPVersion = addon.version;
          return infos.curRPVersion;
        });
    checkPromise("curRPVersion");

    // -------------------------------------------------------------------------
    // app version info
    // -------------------------------------------------------------------------

    promises.lastAppVersion =
        browser.storage.local.get("lastAppVersion").
        then((result) => {
          infos.lastAppVersion =
              result.lastAppVersion as IInfos["lastAppVersion"];
          return infos.lastAppVersion;
        });
    checkPromise("lastAppVersion");

    promises.curAppVersion =
        browser.runtime.getBrowserInfo().
        then(({version}) => {
          infos.curAppVersion = version;
          return version;
        });
    checkPromise("curAppVersion");

    // -------------------------------------------------------------------------
    // store last*Version
    // -------------------------------------------------------------------------

    return Promise.all(JSUtils.objectValues(promises)).then(() => {
      this.infos = infos as IInfos;
      const {curAppVersion, curRPVersion} = infos;
      return browser.storage.local.set({
        lastAppVersion: curAppVersion,
        lastVersion: curRPVersion,
      });
    }).catch((e) => {
      this.log.error("Failed to initialize VersionInfoService", e);
    }) as Promise<void>;
  }
}
