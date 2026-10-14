const leadService = require('../services/lead.service');
const asyncHandler = require('../utils/asyncHandler');

exports.listLeads = asyncHandler( async (req, res) => {

  const leads = await leadService.listLeads(req.validated.query);

  res.status(200).json({ data: leads });

});

exports.createLead = asyncHandler( async (req, res) => {

  const lead = await leadService.createLead(req.validated.body);

  res.status(201).json({ data: lead });

});

exports.updateLead = asyncHandler( async (req, res) => {

  const lead = await leadService.updateLead(req.validated.params.id, req.validated.body);

  res.status(200).json({ data: lead });

});

exports.listDiscussions = asyncHandler( async (req, res) => {

  const discussions = await leadService.listDiscussions(req.validated.params.id);

  res.status(200).json({ data: discussions });

});

exports.createDiscussion = asyncHandler( async (req, res) => {

  const result = await leadService.createDiscussion(
    req.validated.params.id,
    req.validated.body
  );

  res.status(201).json({ data: result });
  
});