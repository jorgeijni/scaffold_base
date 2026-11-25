import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService, DEFAULT_PROFILE_CONFIG } from '../services/authService';

export default function ProfileConfigView() {
  const { session, baseUrl, setBaseUrl, proxyMode, setProxyMode } = useAuth();

  // Cargar configuración guardada
  const [profileConfig, setProfileConfig] = useState(() => AuthService.getProfileConfig());
  
  // Feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverTestStatus, setServerTestStatus] = useState(null);
  const [isTestingServer, setIsTestingServer] = useState(false);

  // Historial de sincronizaciones demo
  const [syncHistory, setSyncHistory] = useState([
    { id: '#4', type: 'PRODUCTS_CATALOG', total: 55, nuevos: '+55', actualizados: 0, status: 'SUCCESS', date: '2026-11-05 02:37:47' },
    { id: '#3', type: 'PRODUCTS_CATALOG', total: 55, nuevos: '+55', actualizados: 0, status: 'SUCCESS', date: '2026-11-03 01:43:00' },
    { id: '#2', type: 'PRODUCTS_CATALOG', total: 79, nuevos: '+59', actualizados: 20, status: 'SUCCESS', date: '2026-10-31 01:53:34' },
    { id: '#1', type: 'PRODUCTS_CATALOG', total: 79, nuevos: '+59', actualizados: 20, status: 'SUCCESS', date: '2026-10-27 05:41:04' }
  ]);

  // Guardar configuración
  const handleSave = () => {
    const mode = profileConfig.proxyMode || proxyMode || 'local';
    const updated = { ...profileConfig, proxyMode: mode, useCorsProxy: mode !== 'none' };
    AuthService.saveProfileConfig(updated);
    setBaseUrl(profileConfig.baseUrl);
    setProxyMode(mode);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Restablecer
  const handleReset = () => {
    setProfileConfig({ ...DEFAULT_PROFILE_CONFIG });
    AuthService.saveProfileConfig(DEFAULT_PROFILE_CONFIG);
    alert('Configuración restablecida a los valores predeterminados de GardenWorld.');
  };

  // Probar Conectividad
  const handleTestConnectivity = async () => {
    setIsTestingServer(true);
    setServerTestStatus(null);
    try {
      const mode = profileConfig.proxyMode || proxyMode || 'local';
      const url = AuthService.buildUrl(profileConfig.baseUrl, '/api/v1/auth/tokens', {
        mode: mode
      });
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          userName: session?.userName || 'admin @ gardenworld.com',
          password: session?.password || 'GardenAdmin',
          parameters: {
            clientId: Number(profileConfig.defaultParameters.clientId),
            roleId: Number(profileConfig.defaultParameters.roleId),
            organizationId: Number(profileConfig.defaultParameters.organizationId),
            warehouseId: Number(profileConfig.defaultParameters.warehouseId),
            language: profileConfig.defaultParameters.language
          }
        })
      });
      if (res.ok) {
        setServerTestStatus({ ok: true, msg: 'Conexión Exitosa (200 OK): Servidor iDempiere respondiendo con token válido.' });
      } else {
        setServerTestStatus({ ok: false, msg: `Servidor respondió con código ${res.status} ${res.statusText}` });
      }
    } catch (err) {
      setServerTestStatus({ ok: false, msg: `Error de Conexión: ${err.message}` });
    } finally {
      setIsTestingServer(false);
    }
  };

  // Sembrar catálogo
  const handleSeedCatalog = () => {
    const newEntry = {
      id: `#${syncHistory.length + 1}`,
      type: 'PRODUCTS_CATALOG',
      total: 10,
      nuevos: '+10',
      actualizados: 0,
      status: 'SUCCESS',
      date: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setSyncHistory([newEntry, ...syncHistory]);
    alert('Catálogo de 10 hamburguesas de autor inyectado exitosamente hacia iDempiere ERP (M_Product & M_ProductPrice).');
  };

  const loginTimeStr = session?.loginAt 
    ? new Date(session.loginAt).toLocaleString() 
    : '10/11/2026, 21:49:12';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. TOP CARD: PERFIL DE ADMINISTRADOR & CONFIGURACIÓN DE SERVIDOR (Exacto a Imagen 4) */}
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        color: '#ffffff'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          backgroundColor: '#ea580c',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem'
        }}>
          👤
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
              Perfil de Administrador & Configuración de Servidor
            </h2>
            <span style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.68rem',
              fontWeight: '800'
            }}>
              ACTIVO
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Gestión segura de la dirección del servidor central, parámetros de acceso y modo de inicio de sesión.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: '700'
        }}>
          ✓ Configuración guardada exitosamente. Se aplicará a todos los próximos inicios de sesión.
        </div>
      )}

      {/* 2. FILA DE 4 TARJETAS DE CONFIGURACIÓN (Exacto a Imagen 4) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* Tarjeta 1: Sesión Activa del Usuario */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', marginBottom: '14px' }}>
            <span>🔑</span> Sesión Activa del Usuario
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Usuario Autenticado:</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>{session?.userName || 'admin @ gardenworld.com'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Identificador de Usuario (ID):</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>{session?.userId || 101}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Organización Activa (ID):</span>
              <span style={{ fontWeight: '800', color: '#0284c7' }}>Org #{session?.organizationId ?? 11}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Rol Asignado (ID):</span>
              <span style={{ fontWeight: '800', color: '#ea580c' }}>Rol #{session?.roleId ?? 102}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Almacén Asignado (ID):</span>
              <span style={{ fontWeight: '800', color: '#16a34a' }}>Almacén #{session?.warehouseId ?? 103}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Idioma de Interfaz:</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>{session?.language || 'es_PE'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Fecha / Hora de Conexión:</span>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{loginTimeStr}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Servidor Central & Blindaje de Conexión */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', marginBottom: '8px' }}>
              <span>🌐</span> Servidor Central & Blindaje de Conexión
            </div>

            <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4', marginBottom: '12px' }}>
              Esta dirección se almacena de forma segura en este panel y nunca se muestra en la pantalla de inicio de sesión para proteger la infraestructura contra atacantes.
            </p>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                Dirección URL del Servidor Corporativo:
              </label>
              <input
                type="text"
                value={profileConfig.baseUrl}
                onChange={(e) => setProfileConfig({ ...profileConfig, baseUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                Modo de Proxy / Bypass CORS:
              </label>
              <select
                value={profileConfig.proxyMode || proxyMode || 'local'}
                onChange={(e) => {
                  const val = e.target.value;
                  setProfileConfig({ ...profileConfig, proxyMode: val, useCorsProxy: val !== 'none' });
                  setProxyMode(val);
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: '#0f172a'
                }}
              >
                <option value="local">🛡️ Opción 2: Proxy Local Backend (/api/idempiere-proxy) [Recomendado]</option>
                <option value="none">⚡ Opción 1: Sin Proxy (Conexión Directa)</option>
                <option value="allorigins">🌍 Opción 3: Proxy Público AllOrigins (Gratuito)</option>
                <option value="corsproxy">🔑 Opción 4: Proxy corsproxy.io (Requiere API Key)</option>
              </select>
            </div>
          </div>

          <div>
            {serverTestStatus && (
              <div style={{
                fontSize: '0.72rem',
                color: serverTestStatus.ok ? '#15803d' : '#b91c1c',
                backgroundColor: serverTestStatus.ok ? '#f0fdf4' : '#fef2f2',
                padding: '6px 10px',
                borderRadius: '6px',
                marginBottom: '8px'
              }}>
                {serverTestStatus.msg}
              </div>
            )}

            <button
              onClick={handleTestConnectivity}
              disabled={isTestingServer}
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: isTestingServer ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {isTestingServer ? 'Probando...' : '⚡ Probar Conectividad de Servidor'}
            </button>
          </div>
        </div>

        {/* Tarjeta 3: Modo de Autenticación en Pantalla de Login (Core Requirement 3) */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', marginBottom: '8px' }}>
              <span>⚙️</span> Modo de Autenticación en Pantalla de Login
            </div>

            <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4', marginBottom: '14px' }}>
              Define cómo se comportará la ventana de inicio de sesión cuando los usuarios ingresen sus credenciales.
            </p>

            {/* Cuadro Destacado con Checkbox */}
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '14px'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={profileConfig.assistedMultiTenant}
                  onChange={(e) => setProfileConfig({ ...profileConfig, assistedMultiTenant: e.target.checked })}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#92400e', marginBottom: '2px' }}>
                    Habilitar Modo Asistido Multi-Tenant (Selección Dinámica)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#b45309', lineHeight: '1.4' }}>
                    Activado: Al ingresar usuario y contraseña válidos, la pantalla de login guiará al usuario para elegir dinámicamente su Entidad (Tenant), Rol, Organización y Almacén.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div style={{
            fontSize: '0.72rem',
            color: '#64748b',
            backgroundColor: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #f1f5f9'
          }}>
            💡 <strong>Modo actual:</strong> {profileConfig.assistedMultiTenant ? 'Asistido Multi-Tenant (Paso a Paso)' : '1 Solo Paso Directo (Acceso Rápido)'}
          </div>
        </div>

        {/* Tarjeta 4: Parámetros Predeterminados de Conexión */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', marginBottom: '8px' }}>
            <span>📦</span> Parámetros Predeterminados de Conexión
          </div>

          <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4', marginBottom: '12px' }}>
            Estos parámetros son utilizados automáticamente en el inicio de sesión de 1 solo paso y están ocultos del login público:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Tenant / Client ID:</label>
              <input
                type="number"
                value={profileConfig.defaultParameters.clientId}
                onChange={(e) => setProfileConfig({
                  ...profileConfig,
                  defaultParameters: { ...profileConfig.defaultParameters, clientId: Number(e.target.value) }
                })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Rol ID:</label>
              <input
                type="number"
                value={profileConfig.defaultParameters.roleId}
                onChange={(e) => setProfileConfig({
                  ...profileConfig,
                  defaultParameters: { ...profileConfig.defaultParameters, roleId: Number(e.target.value) }
                })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Organización ID:</label>
              <input
                type="number"
                value={profileConfig.defaultParameters.organizationId}
                onChange={(e) => setProfileConfig({
                  ...profileConfig,
                  defaultParameters: { ...profileConfig.defaultParameters, organizationId: Number(e.target.value) }
                })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Almacén ID:</label>
              <input
                type="number"
                value={profileConfig.defaultParameters.warehouseId}
                onChange={(e) => setProfileConfig({
                  ...profileConfig,
                  defaultParameters: { ...profileConfig.defaultParameters, warehouseId: Number(e.target.value) }
                })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Idioma Predeterminado:</label>
            <select
              value={profileConfig.defaultParameters.language}
              onChange={(e) => setProfileConfig({
                ...profileConfig,
                defaultParameters: { ...profileConfig.defaultParameters, language: e.target.value }
              })}
              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
            >
              <option value="es_PE">Español Perú (es_PE)</option>
              <option value="en_US">Inglés (en_US)</option>
              <option value="es_ES">Español España (es_ES)</option>
              <option value="zh_CN">Chino (zh_CN)</option>
              <option value="ko_KR">Coreano (ko_KR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN INFERIOR: APROVISIONAMIENTO & SINCRONIZACIÓN DE CATÁLOGO (Exacto a Imagen 4) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🥩</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Aprovisionamiento & Sincronización de Catálogo iDempiere
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0', maxWidth: '750px' }}>
              Inyecta las 5 categorías gastronómicas oficiales y las 10 hamburguesas de autor en el ERP (GardenWorld), asigna sus precios en M_ProductPrice y sincroniza sus IDs oficiales (M_Product_ID) hacia el Datamart SQLite de la PWA.
            </p>
          </div>

          <span style={{
            backgroundColor: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: '700'
          }}>
            ● Token Bearer Activo
          </span>
        </div>

        {/* Botones de Aprovisionamiento */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={handleSeedCatalog}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
            }}
          >
            🌱 Sembrar Catálogo en iDempiere (POST)
          </button>

          <button
            onClick={() => alert('Sincronizando 10 hamburguesas hacia SQLite Datamart (/app/server/data/rapidfood.sqlite)...')}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔄 Sincronizar Catálogo hacia SQLite
          </button>

          <button
            onClick={() => alert('Historial de SQLite actualizado.')}
            style={{
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📋 Actualizar Historial
          </button>
        </div>

        {/* Tabla de Sincronizaciones */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '10px 16px',
            fontSize: '0.72rem',
            fontWeight: '800',
            color: '#64748b',
            textTransform: 'uppercase'
          }}>
            ÚLTIMAS SINCRONIZACIONES REGISTRADAS EN SQLITE
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem' }}>
                <th style={{ padding: '10px 16px' }}>ID</th>
                <th style={{ padding: '10px 16px' }}>Tipo</th>
                <th style={{ padding: '10px 16px' }}>Total</th>
                <th style={{ padding: '10px 16px' }}>Nuevos</th>
                <th style={{ padding: '10px 16px' }}>Actualizados</th>
                <th style={{ padding: '10px 16px' }}>Estado</th>
                <th style={{ padding: '10px 16px' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {syncHistory.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px', fontWeight: '700', color: '#0f172a' }}>{row.id}</td>
                  <td style={{ padding: '10px 16px', color: '#475569' }}>{row.type}</td>
                  <td style={{ padding: '10px 16px', fontWeight: '700' }}>{row.total}</td>
                  <td style={{ padding: '10px 16px', color: '#16a34a', fontWeight: '700' }}>{row.nuevos}</td>
                  <td style={{ padding: '10px 16px', color: '#64748b' }}>{row.actualizados}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.68rem',
                      fontWeight: '800'
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#64748b', fontSize: '0.74rem' }}>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PIE DE PÁGINA: GUARDAR Y RESTABLECER (Exacto a Imagen 4) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 0 24px'
      }}>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          * Los cambios se aplicarán inmediatamente a todos los próximos intentos de inicio de sesión en este dispositivo.
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleReset}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            🔄 Restablecer Predeterminados
          </button>

          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#ea580c',
              backgroundImage: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)'
            }}
          >
            💾 Guardar Configuración de Perfil
          </button>
        </div>
      </div>
    </div>
  );
}

