// Export utility for AquaVision analysis results

export function exportToJSON(results, mode, language) {
  const timestamp = new Date().toISOString();
  const data = {
    exportDate: timestamp,
    analysisType: mode === "strips" ? "Test Strip Analysis" : "Tank Health Check",
    language: language,
    ...results,
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const filename = language === "es" 
    ? `analisis-aquavision-${Date.now()}.json`
    : `aquavision-analysis-${Date.now()}.json`;
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return filename;
}

export function exportToText(results, mode, language, t) {
  const timestamp = new Date().toLocaleString(language === "es" ? "es-ES" : "en-US");
  let text = "";
  
  // Header
  text += "═══════════════════════════════════════════════════\n";
  text += `  AQUAVISION ${mode === "strips" ? (language === "es" ? "ANÁLISIS DE TIRAS" : "STRIP ANALYSIS") : (language === "es" ? "SALUD DEL ACUARIO" : "TANK HEALTH")}\n`;
  text += "═══════════════════════════════════════════════════\n\n";
  text += `${language === "es" ? "Fecha" : "Date"}: ${timestamp}\n\n`;
  
  if (mode === "strips" && results.tanks) {
    // Test Strip Results
    results.tanks.forEach((tank, index) => {
      text += `\n${language === "es" ? "ACUARIO" : "TANK"} ${index + 1}: ${tank.tankId}\n`;
      text += `${language === "es" ? "Tipo de Tira" : "Strip Type"}: ${tank.stripType}\n`;
      text += `${language === "es" ? "Estado General" : "Overall Status"}: ${tank.overallStatus?.toUpperCase()}\n`;
      text += `${language === "es" ? "Nivel de Urgencia" : "Urgency Level"}: ${tank.urgencyLevel}/5\n\n`;
      
      // Parameters
      text += `${language === "es" ? "PARÁMETROS:" : "PARAMETERS:"}\n`;
      text += "───────────────────────────────────────────────────\n";
      tank.parameters?.forEach(param => {
        text += `${param.emoji} ${param.name}: ${param.value} - ${param.status.toUpperCase()}\n`;
        text += `   ${param.note}\n\n`;
      });
      
      // Summary
      text += `\n${language === "es" ? "RESUMEN:" : "SUMMARY:"}\n`;
      text += `${tank.summary}\n\n`;
      
      // Actions
      if (tank.immediateActions?.length > 0) {
        text += `${language === "es" ? "ACCIONES INMEDIATAS:" : "IMMEDIATE ACTIONS:"}\n`;
        tank.immediateActions.forEach((action, i) => {
          text += `${i + 1}. ${action}\n`;
        });
        text += "\n";
      }
      
      if (tank.shortTermActions?.length > 0) {
        text += `${language === "es" ? "ACCIONES A CORTO PLAZO:" : "SHORT-TERM ACTIONS:"}\n`;
        tank.shortTermActions.forEach((action, i) => {
          text += `${i + 1}. ${action}\n`;
        });
        text += "\n";
      }
      
      if (tank.monitoringAdvice) {
        text += `${language === "es" ? "CONSEJO DE MONITOREO:" : "MONITORING ADVICE:"}\n`;
        text += `${tank.monitoringAdvice}\n\n`;
      }
    });
    
    // Cross-tank insights
    if (results.crossTankInsights) {
      text += `\n${language === "es" ? "COMPARACIÓN ENTRE ACUARIOS:" : "CROSS-TANK INSIGHTS:"}\n`;
      text += `${results.crossTankInsights}\n\n`;
    }
    
    // Expert verdict
    if (results.expertVerdict) {
      text += `\n${language === "es" ? "VEREDICTO DEL EXPERTO:" : "EXPERT VERDICT:"}\n`;
      text += `${results.expertVerdict}\n`;
    }
  } else if (mode === "tank") {
    // Tank Health Results
    text += `${language === "es" ? "ESTADO GENERAL" : "OVERALL STATUS"}: ${results.overallStatus?.toUpperCase()}\n`;
    text += `${language === "es" ? "NIVEL DE URGENCIA" : "URGENCY LEVEL"}: ${results.urgencyLevel}/5\n\n`;
    
    // Health Parameters
    text += `${language === "es" ? "EVALUACIÓN DE SALUD:" : "HEALTH ASSESSMENT:"}\n`;
    text += "───────────────────────────────────────────────────\n";
    
    const params = [
      { key: "waterClarity", label: language === "es" ? "Claridad del Agua" : "Water Clarity" },
      { key: "algaePresence", label: language === "es" ? "Presencia de Algas" : "Algae Presence" },
      { key: "fishHealth", label: language === "es" ? "Salud de los Peces" : "Fish Health" },
      { key: "plantHealth", label: language === "es" ? "Salud de las Plantas" : "Plant Health" },
      { key: "substrateCondition", label: language === "es" ? "Condición del Sustrato" : "Substrate Condition" },
      { key: "equipmentStatus", label: language === "es" ? "Estado del Equipamiento" : "Equipment Status" },
    ];
    
    params.forEach(({ key, label }) => {
      if (results[key]) {
        text += `${results[key].emoji || "•"} ${label}: ${results[key].status?.toUpperCase()}\n`;
        text += `   ${results[key].observation}\n\n`;
      }
    });
    
    // Summary
    if (results.summary) {
      text += `\n${language === "es" ? "RESUMEN:" : "SUMMARY:"}\n`;
      text += `${results.summary}\n\n`;
    }
    
    // Actions
    if (results.immediateActions?.length > 0) {
      text += `${language === "es" ? "ACCIONES INMEDIATAS:" : "IMMEDIATE ACTIONS:"}\n`;
      results.immediateActions.forEach((action, i) => {
        text += `${i + 1}. ${action}\n`;
      });
      text += "\n";
    }
    
    if (results.maintenanceRecommendations?.length > 0) {
      text += `${language === "es" ? "RECOMENDACIONES DE MANTENIMIENTO:" : "MAINTENANCE RECOMMENDATIONS:"}\n`;
      results.maintenanceRecommendations.forEach((rec, i) => {
        text += `${i + 1}. ${rec}\n`;
      });
      text += "\n";
    }
    
    if (results.whenToTestWater) {
      text += `${language === "es" ? "CUÁNDO PROBAR EL AGUA:" : "WHEN TO TEST WATER:"}\n`;
      text += `${results.whenToTestWater}\n\n`;
    }
    
    if (results.expertVerdict) {
      text += `\n${language === "es" ? "VEREDICTO DEL EXPERTO:" : "EXPERT VERDICT:"}\n`;
      text += `${results.expertVerdict}\n`;
    }
  }
  
  text += "\n═══════════════════════════════════════════════════\n";
  text += language === "es" 
    ? "Generado por AquaVision - IA para Acuarios\n"
    : "Generated by AquaVision - AI for Aquariums\n";
  text += "═══════════════════════════════════════════════════\n";
  
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const filename = language === "es" 
    ? `analisis-aquavision-${Date.now()}.txt`
    : `aquavision-analysis-${Date.now()}.txt`;
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return filename;
}
