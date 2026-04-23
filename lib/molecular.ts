/** Basic SMILES token check for demo (not a full parser). */
export function isLikelyValidSmiles(s: string | null | undefined): boolean {
  if (!s || !s.trim()) return false
  const t = s.trim()
  if (t.length < 2) return false
  if (/[^A-Za-z0-9@+\-\[\]=\(\)#\\/]/.test(t)) return false
  return true
}

export function prepareSmilesFor3DMol(smiles: string): string {
  return smiles.trim()
}

/** Representative SMILES for demo visualization (simplified organics / clusters as stand-ins). */
export const DEMO_SMILES_BY_FORMULA: Record<string, string> = {
  "Cu/ZnO/Al2O3": "CCO",
  "Pd/Ga2O3": "c1ccccc1",
  "In2O3-ZrO2": "CC(C)O",
  "Cu/ZnO": "CCO",
  "ZnO/Cr2O3": "CC(=O)O",
  "Ni-Fe/Al2O3": "CCCC",
  "Cu-CeO2": "CC#N",
  "Ag-Al2O3": "CC(=O)OC",
  "Pt/TiO2": "C1CCCCC1",
  "Rh/SiO2": "c1ccccc1O",
  "Co-Mo/S": "CCCCCC",
  "Fe3O4@C": "c1ccc2ccccc2c1",
  "HZSM-5": "c1ccc(C)cc1",
  "SAPO-34": "CCN(CC)CC",
  "ZSM-5+Cu": "Cc1ccccc1",
  "Mo2C/WC": "C=C",
  "Ni/HZSM-5": "CCC",
  "PtSn/Al2O3": "CC(C)(C)O",
  "Pd-In2O3": "Oc1ccccc1",
  "Cu-SSZ-13": "NCCN",
  "Cr2O3/SiO2": "CCCl",
  "Ru/Al2O3": "CCBr",
  "Ir/Ta2O5": "CI",
  "Re/SiO2": "CF",
  "WOx/ZrO2": "COC",
  "Nb2O5/SiO2": "CCOC",
  "V2O5/TiO2": "CC(=O)C",
  "Fe-ZSM-5": "c1ccncc1",
  "Co-ZSM-5": "c1cnccn1",
  "H-ZSM-22": "CCCCCCCC",
  "Pt/HZSM-5": "c1ccc(N)cc1",
  "MoOx/C": "CCCCO",
  "Ni-W/AC": "c1ccccc1C",
  "CuCrOx": "CC(=O)CC",
  "Zn-Cr spinel": "CC(=O)CC(C)C",
  "Pd-Zn/Beta": "c1ccc(CC)cc1",
  "Ru/C": "CCCCCCCCC",
  "PtSnIn": "CC[Sn](C)(C)C",
  "CuGaOx": "CC(C)(C)C(=O)O",
  "Fe-MFI": "c1ccc2c(c1)ccc1ccccc12",
  "cellulase-Cel7B": "NCC(=O)O",
  "endoglucanase-EG1": "NC(CO)C(=O)O",
  "CBHII-mutant": "CC(C)C(N)C(=O)O",
  "GH5-family": "CCCC(N)C(=O)O",
  "laccase-LacA": "c1cc(O)c(O)cc1",
  "peroxygenase-AaeUPO": "CC(=O)CCCC",
  "fatty-acid-decarboxylase": "CCCCCCCC(=O)O",
  "olefin-metathesis-Ru": "C=CCCC=C",
  "zeolite-HY": "c1ccc(C(C)(C)C)cc1",
  "ZSM-5-acid": "Cc1cccc(C)c1",
  "RuSn/C": "CCC(O)CC",
  "PtCo/N-C": "c1ccccc1N",
  "NiMoS/Al2O3": "CCCS",
  "CoMo/Al2O3": "CCSCC",
  "FeCrOx": "CC(=O)CC(=O)C",
  "CuZnZrOx": "CC(O)C(O)C",
  "PdAg/C": "CC(=O)Nc1ccccc1",
  "IrOx/SnO2": "O=[Sn](O)O",
  "ReOx/Al2O3": "CC(=O)OC(C)=O",
}

export function resolveDemoSmiles(formula: string, smiles?: string | null): string {
  if (smiles && isLikelyValidSmiles(smiles)) return prepareSmilesFor3DMol(smiles)
  const f = DEMO_SMILES_BY_FORMULA[formula]
  if (f) return f
  return "CCO"
}
