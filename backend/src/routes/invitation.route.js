// backend/src/routes/invitation.routes.js
const express = require('express');
const invitationController = require('../controllers/invitation.controller');

const router = express.Router();

// ✅ Routes pour les invitations

// Inviter un freelancer à une mission
// POST /api/invitations/freelancer/:freelancerId/mission/:missionId
router.post('/freelancer/:freelancerId/mission/:missionId', invitationController.inviteFreelancer);

// Obtenir toutes les invitations envoyées par un client
// GET /api/invitations/client/:clientId
router.get('/client/:clientId', invitationController.getClientInvitations);

// Répondre à une invitation (côté freelancer)
// PUT /api/invitations/freelancer/:freelancerId/invitation/:invitationId/respond
router.put('/freelancer/:freelancerId/invitation/:invitationId/respond', invitationController.respondToInvitation);

// Retirer une invitation (côté client)
// DELETE /api/invitations/client/:clientId/freelancer/:freelancerId/invitation/:invitationId
router.delete('/client/:clientId/freelancer/:freelancerId/invitation/:invitationId', invitationController.withdrawInvitation);

module.exports = router;
