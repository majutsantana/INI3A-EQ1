-- =================================================================================
-- SCRIPT SQL COMPLETO PARA BANCO OFICIAL - CTI UNESP
-- 
-- Este script cria TODOS os dados necessários:
-- - Instituição: cti@unesp.br
-- - Administrador: admin@unesp.br
-- - 5 Responsáveis: resp1@unesp.br até resp5@unesp.br
-- - 10 Alunos: aluno1@unesp.br até aluno10@unesp.br
-- - Horários da instituição (Seg-Sex: manhã/tarde/noite, Sáb: manhã)
-- - Veículos para cada responsável
-- - Horários dos responsáveis (distribuídos)
-- - Horários dos alunos (variados)
-- - Caronas para todos os dias
-- 
-- IMPORTANTE: A senha "12345" será armazenada com hash bcrypt
-- Hash bcrypt para "12345": $2y$10$U.rTTNJd/j28wcG1T0BbKOOnv/Oq9GgltJfMQqzOW0vz42.a9nxKG
-- =================================================================================

DO $$
DECLARE
    -- Hash bcrypt para a senha "12345"
    senha_hash TEXT := '$2y$10$U.rTTNJd/j28wcG1T0BbKOOnv/Oq9GgltJfMQqzOW0vz42.a9nxKG';
    
    -- ID da instituição CTI
    inst_id INT;
    inst_user_id INT;
    
    -- IDs dos responsáveis e alunos
    resp_ids INT[] := ARRAY[]::INT[];
    resp_user_ids INT[] := ARRAY[]::INT[];
    aluno_ids INT[] := ARRAY[]::INT[];
    aluno_user_ids INT[] := ARRAY[]::INT[];
    
    -- Variáveis temporárias
    temp_id INT;
    temp_user_id INT;
    i INT;
BEGIN

    RAISE NOTICE '========================================';
    RAISE NOTICE 'INICIANDO SEEDER COMPLETO - CTI UNESP';
    RAISE NOTICE '========================================';

    -- =================================================================================
    -- 1. CRIAR INSTITUIÇÃO CTI
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '--- CRIANDO INSTITUIÇÃO CTI ---';

    SELECT id INTO inst_id FROM instituicoes WHERE email = 'cti@unesp.br' LIMIT 1;
    
    IF inst_id IS NULL THEN
        INSERT INTO instituicoes (nome, email, endereco, cnpj, telefone, plano, imagem, created_at, updated_at)
        VALUES (
            'Colégio Técnico Industrial - UNESP',
            'cti@unesp.br',
            'Rua Engenheiro Luiz Edmundo Carrijo Coube, 14-01 - Vargem Limpa, Bauru - SP',
            '48.031.918/0001-24',
            '1431036000',
            'B',
            NULL,
            LOCALTIMESTAMP,
            LOCALTIMESTAMP
        )
        RETURNING id INTO inst_id;

        -- Criar usuário da instituição
        INSERT INTO usuarios (login, email, senha, created_at, updated_at)
        VALUES ('cti@unesp.br', 'cti@unesp.br', senha_hash, LOCALTIMESTAMP, LOCALTIMESTAMP)
        RETURNING id INTO inst_user_id;

        -- Associar perfil de instituição
        INSERT INTO perfil_usuario (perfil_id, usuario_id, instituicao_id, created_at, updated_at)
        VALUES (2, inst_user_id, inst_id, LOCALTIMESTAMP, LOCALTIMESTAMP);

        RAISE NOTICE '✓ Instituição CTI criada (ID: %)', inst_id;
    ELSE
        RAISE NOTICE '✓ Instituição CTI já existe (ID: %)', inst_id;
    END IF;

    -- =================================================================================
    -- 2. CRIAR ADMINISTRADOR
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '--- CRIANDO ADMINISTRADOR ---';

    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@unesp.br') THEN
        INSERT INTO usuarios (login, email, senha, created_at, updated_at)
        VALUES ('admin@unesp.br', 'admin@unesp.br', senha_hash, LOCALTIMESTAMP, LOCALTIMESTAMP)
        RETURNING id INTO temp_user_id;

        INSERT INTO perfil_usuario (perfil_id, usuario_id, instituicao_id, created_at, updated_at)
        VALUES (1, temp_user_id, NULL, LOCALTIMESTAMP, LOCALTIMESTAMP);

        RAISE NOTICE '✓ Administrador criado (admin@unesp.br)';
    ELSE
        RAISE NOTICE '✓ Administrador já existe';
    END IF;

    -- =================================================================================
    -- 3. CRIAR 5 RESPONSÁVEIS
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '--- CRIANDO 5 RESPONSÁVEIS ---';

    FOR i IN 1..5 LOOP
        IF NOT EXISTS (SELECT 1 FROM responsaveis WHERE email = 'resp' || i || '@unesp.br') THEN
            INSERT INTO usuarios (login, email, senha, created_at, updated_at)
            VALUES ('resp' || i || '@unesp.br', 'resp' || i || '@unesp.br', senha_hash, LOCALTIMESTAMP, LOCALTIMESTAMP)
            RETURNING id INTO temp_user_id;
            
            resp_user_ids := array_append(resp_user_ids, temp_user_id);

            INSERT INTO responsaveis (nome, cpf, email, telefone, genero, endereco, imagem, id_inst, created_at, updated_at)
            VALUES (
                'Responsável ' || CASE i WHEN 1 THEN 'Um' WHEN 2 THEN 'Dois' WHEN 3 THEN 'Três' WHEN 4 THEN 'Quatro' ELSE 'Cinco' END,
                LPAD(i::TEXT, 3, '0') || '.' || LPAD(i::TEXT, 3, '0') || '.' || LPAD(i::TEXT, 3, '0') || '-' || LPAD(i::TEXT, 2, '0'),
                'resp' || i || '@unesp.br',
                '1499888777' || i,
                CASE WHEN i % 2 = 1 THEN 'Masculino' ELSE 'Feminino' END,
                CASE i
                    WHEN 1 THEN 'Rua das Palmeiras, 100 - Vila Cardia, Bauru - SP, 17064-854'
                    WHEN 2 THEN 'Avenida Paulista, 200 - Vila Cardia, Bauru - SP, 17018-825'
                    WHEN 3 THEN 'Rua das Azaleias, 300 - Vila Cardia, Bauru - SP, 17054-080'
                    WHEN 4 THEN 'Rua das Camélias, 400 - Vila Cardia, Bauru - SP, 17033-821'
                    ELSE 'Rua Nova, 500 - Vila Cardia, Bauru - SP, 17065-380'
                END,
                NULL,
                inst_id,
                LOCALTIMESTAMP,
                LOCALTIMESTAMP
            )
            RETURNING id INTO temp_id;
            
            resp_ids := array_append(resp_ids, temp_id);

            INSERT INTO perfil_usuario (perfil_id, usuario_id, instituicao_id, created_at, updated_at)
            VALUES (3, temp_user_id, inst_id, LOCALTIMESTAMP, LOCALTIMESTAMP);

            RAISE NOTICE '✓ Responsável % criado', i;
        ELSE
            SELECT id INTO temp_id FROM responsaveis WHERE email = 'resp' || i || '@unesp.br' LIMIT 1;
            resp_ids := array_append(resp_ids, temp_id);
            RAISE NOTICE '⚠ Responsável % já existe', i;
        END IF;
    END LOOP;

    -- =================================================================================
    -- 4. CRIAR 10 ALUNOS
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '--- CRIANDO 10 ALUNOS ---';

    FOR i IN 1..10 LOOP
        IF NOT EXISTS (SELECT 1 FROM alunos WHERE email = 'aluno' || i || '@unesp.br') THEN
            INSERT INTO usuarios (login, email, senha, created_at, updated_at)
            VALUES ('aluno' || i || '@unesp.br', 'aluno' || i || '@unesp.br', senha_hash, LOCALTIMESTAMP, LOCALTIMESTAMP)
            RETURNING id INTO temp_user_id;
            
            aluno_user_ids := array_append(aluno_user_ids, temp_user_id);

            INSERT INTO alunos (nome, cpf, ra, email, genero, endereco, telefone, imagem, id_inst, created_at, updated_at)
            VALUES (
                'Aluno ' || CASE i WHEN 1 THEN 'Um' WHEN 2 THEN 'Dois' WHEN 3 THEN 'Três' WHEN 4 THEN 'Quatro' WHEN 5 THEN 'Cinco' 
                WHEN 6 THEN 'Seis' WHEN 7 THEN 'Sete' WHEN 8 THEN 'Oito' WHEN 9 THEN 'Nove' ELSE 'Dez' END,
                LPAD(i::TEXT, 3, '0') || '.' || LPAD(i::TEXT, 3, '0') || '.' || LPAD(i::TEXT, 3, '0') || '-' || LPAD(i::TEXT, 2, '0'),
                '235700' || i,
                'aluno' || i || '@unesp.br',
                CASE WHEN i % 2 = 1 THEN 'Masculino' ELSE 'Feminino' END,
                CASE i
                    WHEN 1 THEN 'Rua das Acácias, 100 - Vila Cardia, Bauru - SP, 17067-130'
                    WHEN 2 THEN 'Avenida Nações Unidas, 200 - Vila Cardia, Bauru - SP, 17025-774'
                    WHEN 3 THEN 'Rua dos Ipês, 300 - Vila Cardia, Bauru - SP, 17022-899'
                    WHEN 4 THEN 'Rua das Rosas, 400 - Vila Cardia, Bauru - SP, 17054-580'
                    WHEN 5 THEN 'Avenida Duque de Caxias, 500 - Vila Cardia, Bauru - SP, 17025-164'
                    WHEN 6 THEN 'Rua das Margaridas, 600 - Vila Cardia, Bauru - SP, 17021-869'
                    WHEN 7 THEN 'Rua das Violetas, 700 - Vila Cardia, Bauru - SP, 17066-140'
                    WHEN 8 THEN 'Avenida Getúlio Vargas, 800 - Vila Cardia, Bauru - SP, 17020-460'
                    WHEN 9 THEN 'Rua das Orquídeas, 900 - Vila Cardia, Bauru - SP, 17037-520'
                    ELSE 'Rua das Tulipas, 1000 - Vila Cardia, Bauru - SP, 17027-420'
                END,
                '1499123456' || i,
                NULL,
                inst_id,
                LOCALTIMESTAMP,
                LOCALTIMESTAMP
            )
            RETURNING id INTO temp_id;
            
            aluno_ids := array_append(aluno_ids, temp_id);

            INSERT INTO perfil_usuario (perfil_id, usuario_id, instituicao_id, created_at, updated_at)
            VALUES (4, temp_user_id, inst_id, LOCALTIMESTAMP, LOCALTIMESTAMP);

            RAISE NOTICE '✓ Aluno % criado', i;
        ELSE
            SELECT id INTO temp_id FROM alunos WHERE email = 'aluno' || i || '@unesp.br' LIMIT 1;
            aluno_ids := array_append(aluno_ids, temp_id);
            RAISE NOTICE '⚠ Aluno % já existe', i;
        END IF;
    END LOOP;

    -- =================================================================================
    -- 5. HORÁRIOS DA INSTITUIÇÃO
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '--- CRIANDO HORÁRIOS DA INSTITUIÇÃO ---';

    DELETE FROM horarios_instituicoes WHERE id_inst = inst_id;

    -- Segunda a Sexta (1-5): Manhã, Tarde, Noite
    FOR i IN 1..5 LOOP
        INSERT INTO horarios_instituicoes (id_inst, dia_semana, hora_inicio, hora_fim, periodo, created_at, updated_at)
        VALUES 
            (inst_id, i, '07:15:00', '12:15:00', 'manha', LOCALTIMESTAMP, LOCALTIMESTAMP),
            (inst_id, i, '14:00:00', '17:15:00', 'tarde', LOCALTIMESTAMP, LOCALTIMESTAMP),
            (inst_id, i, '19:00:00', '22:00:00', 'noite', LOCALTIMESTAMP, LOCALTIMESTAMP);
    END LOOP;

    -- Sábado (6): Só manhã
    INSERT INTO horarios_instituicoes (id_inst, dia_semana, hora_inicio, hora_fim, periodo, created_at, updated_at)
    VALUES (inst_id, 6, '07:15:00', '12:15:00', 'manha', LOCALTIMESTAMP, LOCALTIMESTAMP);

    RAISE NOTICE '✓ Horários da instituição criados';

    -- =================================================================================
    -- 6. VEÍCULOS PARA RESPONSÁVEIS
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '--- CRIANDO VEÍCULOS ---';

    FOR i IN 1..array_length(resp_ids, 1) LOOP
        IF NOT EXISTS (SELECT 1 FROM veiculos WHERE id_resp = resp_ids[i]) THEN
            INSERT INTO veiculos (modelo, placa, cor, qtde_assentos, id_resp, created_at, updated_at)
            VALUES (
                CASE i WHEN 1 THEN 'Honda Civic' WHEN 2 THEN 'Toyota Corolla' WHEN 3 THEN 'Volkswagen Gol' WHEN 4 THEN 'Fiat Uno' ELSE 'Chevrolet Onix' END,
                CASE i WHEN 1 THEN 'ABC-1234' WHEN 2 THEN 'DEF-5678' WHEN 3 THEN 'GHI-9012' WHEN 4 THEN 'JKL-3456' ELSE 'MNO-7890' END,
                CASE i WHEN 1 THEN 'Branco' WHEN 2 THEN 'Prata' WHEN 3 THEN 'Preto' WHEN 4 THEN 'Vermelho' ELSE 'Azul' END,
                CASE i WHEN 1 THEN 4 WHEN 2 THEN 4 WHEN 3 THEN 3 WHEN 4 THEN 2 ELSE 4 END,
                resp_ids[i],
                LOCALTIMESTAMP,
                LOCALTIMESTAMP
            );
            RAISE NOTICE '✓ Veículo criado para responsável %', i;
        END IF;
    END LOOP;

    -- =================================================================================
    -- 7. HORÁRIOS DOS RESPONSÁVEIS
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '--- CRIANDO HORÁRIOS DOS RESPONSÁVEIS ---';

    -- Limpar horários existentes
    FOR i IN 1..array_length(resp_ids, 1) LOOP
        DELETE FROM horarios_responsaveis WHERE id_responsavel = resp_ids[i];
    END LOOP;

    -- Distribuição dos responsáveis por dia e período
    -- Segunda: Resp1 (manhã), Resp2 (tarde), Resp3 (noite), Resp4 (manhã), Resp5 (tarde)
    -- Terça: Resp1 (tarde), Resp2 (noite), Resp3 (manha), Resp4 (tarde), Resp5 (noite)
    -- E assim por diante...

    FOR dia IN 1..6 LOOP
        FOR resp_idx IN 1..array_length(resp_ids, 1) LOOP
            DECLARE
                periodo TEXT;
                hora_entrada TIME;
                hora_saida TIME;
            BEGIN
                -- Determinar período baseado no dia e índice do responsável
                IF dia = 6 THEN
                    -- Sábado: só manhã
                    periodo := 'manha';
                    hora_entrada := '07:15:00';
                    hora_saida := '12:15:00';
                ELSE
                    -- Segunda a Sexta: distribuir períodos
                    CASE (resp_idx + dia - 1) % 3
                        WHEN 0 THEN periodo := 'manha'; hora_entrada := '07:15:00'; hora_saida := '12:15:00';
                        WHEN 1 THEN periodo := 'tarde'; hora_entrada := '14:00:00'; hora_saida := '17:15:00';
                        ELSE periodo := 'noite'; hora_entrada := '19:00:00'; hora_saida := '22:00:00';
                    END CASE;
                END IF;

                INSERT INTO horarios_responsaveis (id_responsavel, dia_semana, tipo, hora, habilitado, created_at, updated_at)
                VALUES 
                    (resp_ids[resp_idx], dia, 'entrada', hora_entrada, true, LOCALTIMESTAMP, LOCALTIMESTAMP),
                    (resp_ids[resp_idx], dia, 'saida', hora_saida, true, LOCALTIMESTAMP, LOCALTIMESTAMP);
            END;
        END LOOP;
    END LOOP;

    RAISE NOTICE '✓ Horários dos responsáveis criados';

    -- =================================================================================
    -- 8. HORÁRIOS DOS ALUNOS
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '--- CRIANDO HORÁRIOS DOS ALUNOS ---';

    -- Limpar horários existentes
    FOR i IN 1..array_length(aluno_ids, 1) LOOP
        DELETE FROM horarios_alunos WHERE id_aluno = aluno_ids[i];
    END LOOP;

    FOR aluno_idx IN 1..array_length(aluno_ids, 1) LOOP
        DECLARE
            periodo TEXT;
            hora_entrada TIME;
            hora_saida TIME;
        BEGIN
            -- Alunos 1-3: manhã, 4-6: tarde, 7-9: noite, 10: varia
            IF aluno_idx <= 3 THEN
                periodo := 'manha';
            ELSIF aluno_idx <= 6 THEN
                periodo := 'tarde';
            ELSIF aluno_idx <= 9 THEN
                periodo := 'noite';
            ELSE
                -- Aluno 10: varia
                periodo := CASE (aluno_idx % 3) WHEN 0 THEN 'manha' WHEN 1 THEN 'tarde' ELSE 'noite' END;
            END IF;

            CASE periodo
                WHEN 'manha' THEN hora_entrada := '07:15:00'; hora_saida := '12:15:00';
                WHEN 'tarde' THEN hora_entrada := '14:00:00'; hora_saida := '17:15:00';
                ELSE hora_entrada := '19:00:00'; hora_saida := '22:00:00';
            END CASE;

            -- Segunda a Sexta
            FOR dia IN 1..5 LOOP
                INSERT INTO horarios_alunos (id_aluno, dia_semana, tipo, hora, habilitado, created_at, updated_at)
                VALUES 
                    (aluno_ids[aluno_idx], dia, 'entrada', hora_entrada, true, LOCALTIMESTAMP, LOCALTIMESTAMP),
                    (aluno_ids[aluno_idx], dia, 'saida', hora_saida, true, LOCALTIMESTAMP, LOCALTIMESTAMP);
            END LOOP;

            -- Sábado: só manhã
            INSERT INTO horarios_alunos (id_aluno, dia_semana, tipo, hora, habilitado, created_at, updated_at)
            VALUES 
                (aluno_ids[aluno_idx], 6, 'entrada', '07:15:00', true, LOCALTIMESTAMP, LOCALTIMESTAMP),
                (aluno_ids[aluno_idx], 6, 'saida', '12:15:00', true, LOCALTIMESTAMP, LOCALTIMESTAMP);
        END;
    END LOOP;

    RAISE NOTICE '✓ Horários dos alunos criados';

    -- =================================================================================
    -- 9. CRIAR CARONAS
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '--- CRIANDO CARONAS ---';

    -- Limpar caronas existentes
    DELETE FROM caronas WHERE id_aluno = ANY(aluno_ids) OR id_responsavel = ANY(resp_ids);

    -- Criar caronas aceitas para todos os dias
    -- Distribuir alunos entre responsáveis de forma equilibrada
    FOR dia IN 1..6 LOOP
        IF dia <= 5 THEN
            -- Segunda a Sexta: Manhã, Tarde, Noite
            -- Manhã: 2 responsáveis, 4 alunos
            FOR resp_idx IN 1..2 LOOP
                FOR aluno_idx IN (resp_idx * 2 - 1)..(resp_idx * 2) LOOP
                    IF aluno_idx <= array_length(aluno_ids, 1) THEN
                        INSERT INTO caronas (id_aluno, id_responsavel, dia_semana, tipo, hora, status, distancia_km, data_solicitacao, data_aceitacao, created_at, updated_at)
                        VALUES (aluno_ids[aluno_idx], resp_ids[resp_idx], dia, 'entrada', '07:15:00', 'aceita', 5.0, LOCALTIMESTAMP, LOCALTIMESTAMP, LOCALTIMESTAMP, LOCALTIMESTAMP);
                    END IF;
                END LOOP;
            END LOOP;

            -- Tarde: 2 responsáveis, 3 alunos
            FOR resp_idx IN 3..4 LOOP
                aluno_idx := 4 + (resp_idx - 3) + 1;
                IF aluno_idx <= array_length(aluno_ids, 1) THEN
                    INSERT INTO caronas (id_aluno, id_responsavel, dia_semana, tipo, hora, status, distancia_km, data_solicitacao, data_aceitacao, created_at, updated_at)
                    VALUES (aluno_ids[aluno_idx], resp_ids[resp_idx], dia, 'entrada', '14:00:00', 'aceita', 5.0, LOCALTIMESTAMP, LOCALTIMESTAMP, LOCALTIMESTAMP, LOCALTIMESTAMP);
                END IF;
            END LOOP;

            -- Noite: 1 responsável, 3 alunos
            FOR aluno_idx IN 8..10 LOOP
                IF aluno_idx <= array_length(aluno_ids, 1) THEN
                    INSERT INTO caronas (id_aluno, id_responsavel, dia_semana, tipo, hora, status, distancia_km, data_solicitacao, data_aceitacao, created_at, updated_at)
                    VALUES (aluno_ids[aluno_idx], resp_ids[5], dia, 'entrada', '19:00:00', 'aceita', 5.0, LOCALTIMESTAMP, LOCALTIMESTAMP, LOCALTIMESTAMP, LOCALTIMESTAMP);
                END IF;
            END LOOP;
        ELSE
            -- Sábado: só manhã, distribuir todos os alunos entre 3 responsáveis
            FOR resp_idx IN 1..3 LOOP
                FOR aluno_idx IN (resp_idx * 3 - 2)..(resp_idx * 3) LOOP
                    IF aluno_idx <= array_length(aluno_ids, 1) THEN
                        INSERT INTO caronas (id_aluno, id_responsavel, dia_semana, tipo, hora, status, distancia_km, data_solicitacao, data_aceitacao, created_at, updated_at)
                        VALUES (aluno_ids[aluno_idx], resp_ids[resp_idx], dia, 'entrada', '07:15:00', 'aceita', 5.0, LOCALTIMESTAMP, LOCALTIMESTAMP, LOCALTIMESTAMP, LOCALTIMESTAMP);
                    END IF;
                END LOOP;
            END LOOP;
        END IF;
    END LOOP;

    RAISE NOTICE '✓ Caronas criadas';

    -- =================================================================================
    -- RESUMO FINAL
    -- =================================================================================
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDER CONCLUÍDO COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ Instituição: cti@unesp.br';
    RAISE NOTICE '✓ Administrador: admin@unesp.br';
    RAISE NOTICE '✓ 5 Responsáveis: resp1@unesp.br até resp5@unesp.br';
    RAISE NOTICE '✓ 10 Alunos: aluno1@unesp.br até aluno10@unesp.br';
    RAISE NOTICE '✓ Horários da instituição';
    RAISE NOTICE '✓ Veículos para responsáveis';
    RAISE NOTICE '✓ Horários dos responsáveis';
    RAISE NOTICE '✓ Horários dos alunos';
    RAISE NOTICE '✓ Caronas para todos os dias';
    RAISE NOTICE '';
    RAISE NOTICE 'Senha para TODOS: 12345';
    RAISE NOTICE '========================================';

END $$;

