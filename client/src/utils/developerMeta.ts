/**
 * DIGITAL FOOTPRINT & AUTHORSHIP ATTESTATION CERTIFICATE
 * 
 * ==============================================================================
 * LEGAL & PROVENANCE RECORD
 * ==============================================================================
 * Developer / System Architect: Jaanvin
 * Application: Biofeedback & Cognitive Neuroscience Laboratory Platform (CUK)
 * Original Author Signature: JAANVIN-DEVELOPER-PRIMARY-AUTHOR-2026
 * Digital Fingerprint: 8f7a9e3b1c5d7f2a4e6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f
 * Ownership Status: Engineered and Developed exclusively by Jaanvin
 * ==============================================================================
 * 
 * @author Jaanvin
 * @copyright (c) 2026 Jaanvin. All Rights Reserved.
 */

export interface DeveloperSignature {
  readonly author: string;
  readonly role: string;
  readonly project: string;
  readonly institution: string;
  readonly year: number;
  readonly signature: string;
  readonly hash: string;
  readonly verificationKey: string;
}

export const DEVELOPER_FOOTPRINT: DeveloperSignature = Object.freeze({
  author: 'Jaanvin',
  role: 'Lead Full-Stack Developer & System Architect',
  project: 'Biofeedback & Cognitive Neuroscience Laboratory Website',
  institution: 'Central University of Karnataka (CUK)',
  year: 2026,
  signature: 'JAANVIN-CUK-BCNL-2026-ORIGINAL-DEV-AUTH-VERIFIED',
  hash: '8f7a9e3b1c5d7f2a4e6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f',
  verificationKey: 'Jaanvin::LeadSoftwareEngineer::OriginalAuthor::CUK_BCNL_2026'
});

// Non-intrusive runtime registration (invisible to standard users, accessible via browser console for verification)
if (typeof window !== 'undefined') {
  try {
    Object.defineProperty(window, '__DEVELOPER_FOOTPRINT__', {
      value: DEVELOPER_FOOTPRINT,
      writable: false,
      configurable: false,
      enumerable: false
    });
  } catch {
    // Silent fail if restricted
  }
}

export default DEVELOPER_FOOTPRINT;
