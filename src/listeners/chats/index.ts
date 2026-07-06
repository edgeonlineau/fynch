import { registerWithRetry } from '../../utilities/register-with-retry';
import { register as beacon } from './beacon';
import { register as livechat } from './livechat';
import { register as podium } from './podium';
import { register as tawk } from './tawk';

// Chat widgets load asynchronously, usually well after this script, so their
// detection retries at DOMContentLoaded, window load, and a short poll.
registerWithRetry(beacon);
registerWithRetry(livechat);
podium();
tawk();
