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
  readonly fundingProvenance: string;
  readonly signature: string;
  readonly hash: string;
  readonly verificationKey: string;
}

export const DEVELOPER_FOOTPRINT: DeveloperSignature = Object.freeze({
  author: 'Jaanvin',
  role: 'Lead Full-Stack Developer, Architect & Sponsor',
  project: 'Biofeedback & Cognitive Neuroscience Laboratory Web Platform',
  institution: 'Department of Psychology, Central University of Karnataka (CUK)',
  year: 2026,
  fundingProvenance: 'Privately Funded, Commissioned & Developed exclusively by Jaanvin',
  signature: 'JAANVIN-CUK-BCNL-2026-PRIMARY-SPONSOR-AND-ARCHITECT',
  hash: '8f7a9e3b1c5d7f2a4e6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f',
  verificationKey: 'Jaanvin::SystemArchitect::PlatformSponsor::CUK_BCNL_2026'
});

// Non-intrusive runtime registration and discreet developer console banner
if (typeof window !== 'undefined') {
  try {
    Object.defineProperty(window, '__DEVELOPER_FOOTPRINT__', {
      value: DEVELOPER_FOOTPRINT,
      writable: false,
      configurable: false,
      enumerable: false
    });

    (window as any).verifyProvenance = () => {
      console.table(DEVELOPER_FOOTPRINT);
      return 'Verified: Engineered, Funded & Architected by Jaanvin (2026)';
    };

    // Discreet dev console signature banner
    console.log(
      '%c BCNL Platform %c Engineered & Funded by Jaanvin %c © 2026 ',
      'background: #031533; color: #93c5fd; font-weight: bold; padding: 3px 6px; border-radius: 4px 0 0 4px; font-size: 10px;',
      'background: #0f172a; color: #38bdf8; font-weight: bold; padding: 3px 6px; font-size: 10px; border-left: 1px solid #1e293b; border-right: 1px solid #1e293b;',
      'background: #1e293b; color: #94a3b8; font-weight: bold; padding: 3px 6px; border-radius: 0 4px 4px 0; font-size: 10px;'
    );
  } catch {
    // Silent fail if restricted
  }
}

export default DEVELOPER_FOOTPRINT;
