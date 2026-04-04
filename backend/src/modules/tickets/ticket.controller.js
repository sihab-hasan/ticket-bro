'use strict';
const asyncHandler   = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const ticketService  = require('./ticket.service');
const { generateTicketPdf } = require('../../common/utils/generateTicketPDF');

const getId = (u) => u?._id || u?.id || u?.userId;

class TicketController {
  getMyTickets   = asyncHandler(async (req, res) => {
    const r = await ticketService.getMyTickets(getId(req.user), req.query);
    sendSuccess(res, 'Tickets fetched.', r);
  });
  getTicketByCode = asyncHandler(async (req, res) => {
    const ticket = await ticketService.getTicketByCode(req.params.code, getId(req.user));
    sendSuccess(res, 'Ticket fetched.', { ticket });
  });
  downloadTicket = asyncHandler(async (req, res) => {
    const ticket = await ticketService.downloadTicket(req.params.code, getId(req.user));
    const ticketBuffer = await generateTicketPdf({ ticket });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ticket-${req.params.code}.pdf"`,
    );
    res.send(ticketBuffer);
  });
  validateTicket = asyncHandler(async (req, res) => {
    const ticket = await ticketService.validateTicket(req.params.code, req.user);
    sendSuccess(res, 'Ticket validated.', { ticket });
  });
  transferTicket = asyncHandler(async (req, res) => {
    const ticket = await ticketService.transferTicket(req.params.code, getId(req.user), req.body.toEmail);
    sendSuccess(res, 'Ticket transferred.', { ticket });
  });
  cancelTicket   = asyncHandler(async (req, res) => {
    const ticket = await ticketService.cancelTicket(req.params.code, getId(req.user));
    sendSuccess(res, 'Ticket cancelled.', { ticket });
  });
}
module.exports = new TicketController();
