import { registerWithRetry } from '../../utilities/register-with-retry';
import { register as calendly } from './calendly';
import { register as lineleader } from './lineleader';
import { register as nowbookit } from './nowbookit';
import { register as opentable } from './opentable';
import { register as sevenrooms } from './sevenrooms';

calendly();
// The LineLeader widget injects window.crmForm after page load, so its
// detection retries at DOMContentLoaded, window load, and a short poll.
registerWithRetry(lineleader);
nowbookit();
opentable();
sevenrooms();
