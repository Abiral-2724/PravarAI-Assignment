const router = require('express').Router();
const controller = require('../controllers/lead.controller');
const validate = require('../middleware/validate');
const v = require('../validators/lead.validator');

router.get(
  '/',
   validate({ query: v.listLeadsQuery }), 
   controller.listLeads);

router.post(
  '/', 
  validate({ body: v.createLeadBody }), 
  controller.createLead);

router.patch(
  '/:id',
  validate({ params: v.idParam, body: v.updateLeadBody }),
  controller.updateLead
);

router.get(
  '/:id/discussions',
  validate({ params: v.idParam }),
  controller.listDiscussions
);

router.post(
  '/:id/discussions',
  validate({ params: v.idParam, body: v.createDiscussionBody }),
  controller.createDiscussion
);

module.exports = router;