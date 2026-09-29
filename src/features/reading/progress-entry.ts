import { registerPageFeature } from '../../lib/browser/lifecycle';
import { mountProgress } from './progress';
registerPageFeature('reading-progress', mountProgress);
