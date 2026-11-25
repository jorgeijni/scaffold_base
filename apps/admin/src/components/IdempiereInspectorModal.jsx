import React from 'react';
import TokenInfoModal from './TokenInfoModal';

/**
 * IdempiereInspectorModal
 * Componente homologado con laboratorio1 que proyecta la auditoría del token
 * y cumplimiento de directivas iDempiere REST API v1.
 */
export default function IdempiereInspectorModal({ isOpen = true, onClose }) {
  return <TokenInfoModal isOpen={isOpen} onClose={onClose} />;
}
