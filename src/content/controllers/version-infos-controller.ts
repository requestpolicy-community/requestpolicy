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

import {IController} from "content/lib/classes/controllers";
import {Log as log} from "content/models/log";
import {Storage} from "content/models/storage";
import {VersionInfos} from "content/models/version-infos";

function updateLastVersions() {
  const {curAppVersion, curRPVersion} = VersionInfos;
  browser.storage.local.set({
    lastAppVersion: curAppVersion,
    lastVersion: curRPVersion,
  }).catch((e) => {
    log.error(`Failed to update last app and RP version:`, e);
  });
}

export const VersionInfosController: IController = {
  startupPreconditions: [
    Storage.pReady,
    VersionInfos.pReady,
  ],
  startup() {
    updateLastVersions();
  },
};
