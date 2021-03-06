/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * RequestPolicy - A Firefox extension for control over cross-site requests.
 * Copyright (c) 2017 Martin Kimmerle
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

import { App } from "app/interfaces";
import {IListenInterface} from "lib/classes/listeners";
import {OverridableSet} from "lib/classes/set";
import {createListenersMap} from "lib/utils/listener-factories";

export enum NotificationID {
  InitialSetup,
  MultipleRPInstallations,
}

const URI_MAP = new Map([
  [
    NotificationID.InitialSetup,
    "about:requestpolicy?setup",
  ],
  [
    NotificationID.MultipleRPInstallations,
    "chrome://rpcontinued/content/multiple-installations.html",
  ],
]);

export class NotificationsSet extends OverridableSet<NotificationID> {
  public onAdded: IListenInterface;
  public onDeleted: IListenInterface;
  public onTabOpened: IListenInterface;
  private eventListenersMap = createListenersMap([
    "onAdded",
    "onDeleted",
    "onTabOpened",
  ]).listenersMap;

  constructor(
      private readonly windowService: App.services.IWindowService,
  ) {
    super();
    this.onAdded = this.eventListenersMap.onAdded.interface;
    this.onDeleted = this.eventListenersMap.onDeleted.interface;
    this.onTabOpened = this.eventListenersMap.onTabOpened.interface;
  }

  public add(aID: NotificationID): this {
    if (this.has(aID)) return this;
    super.add(aID);
    this.eventListenersMap.onAdded.emit(aID);
    return this;
  }
  public delete(aID: NotificationID): boolean {
    if (!this.has(aID)) return false;
    this.delete(aID);
    this.eventListenersMap.onDeleted.emit(aID);
    return true;
  }

  public async openTab(aID: NotificationID): Promise<void> {
    const win = this.windowService.getMostRecentBrowserWindow();
    const tabbrowser = await this.windowService.promiseTabBrowser(win);
    tabbrowser.selectedTab = tabbrowser.addTab(URI_MAP.get(aID)!);
    this.eventListenersMap.onTabOpened.emit(aID);
  }
}
