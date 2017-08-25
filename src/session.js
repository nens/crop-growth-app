// import { LizardApiClient } from 'lizard-api-client';
import { getBootstrap } from "lizard-api-client";

export function userIsLoggedIn() {
  return getBootstrap();
}