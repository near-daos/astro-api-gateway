{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "astro-api.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "astro-api.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "astro-api.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "astro-api.labels" -}}
helm.sh/chart: {{ include "astro-api.chart" . }}
{{ include "astro-api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- if eq .Values.environment.DATADOG_APM_ENABLED "true" }}
tags.datadoghq.com/env: "{{ .Values.environment.DATADOG_ENV }}"
tags.datadoghq.com/service: astro-api
tags.datadoghq.com/version: 0.0.3
{{- end -}}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "astro-api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "astro-api.name" . }}
app.kubernetes.io/instance: "astro-api"
{{- end -}}

{{/*
Metadata labels
*/}}
{{- define "astro-api.metadataLabels" -}}
app.kubernetes.io/name: {{ include "astro-api.name" . }}
app.kubernetes.io/instance: "astro-api"
{{- if eq .Values.environment.DATADOG_APM_ENABLED "true" }}
tags.datadoghq.com/env: "{{ .Values.environment.DATADOG_ENV }}"
tags.datadoghq.com/service: astro-api
tags.datadoghq.com/version: 0.0.3
{{- end -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "astro-api.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "astro-api.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{- define "node.maxOldSpaceSize" -}}
{{/* get memory limit and set max old space size equal to it minus 200Mb for other areas */}}
{{- $size := toString .Values.resources.limits.memory -}}
{{- if regexMatch "([0-9]+)[Mm][Ii]$" $size -}}
{{- $size = mustRegexReplaceAll "([0-9]+)[Mm][Ii]" $size "$1" -}}
{{- end -}}
{{- if regexMatch "([0-9]+)[Mm]$" $size -}}
{{- $size = mul (mustRegexReplaceAll "([0-9]+)[Mm]" $size "$1") 0.976 -}}
{{- end -}}
{{- if regexMatch "([0-9]+)[Gg][Ii]$" $size -}}
{{- $size = mul (mustRegexReplaceAll "([0-9]+)[Gg][Ii]" $size "$1") 1024 -}}
{{- end -}}
{{- if regexMatch "([0-9]+)[Gg]$" $size -}}
{{- $size = mul (mustRegexReplaceAll "([0-9]+)[Gg]" $size "$1") 976 -}}
{{- end -}}
{{- $size = toString (sub (int $size) 200) -}}
{{- printf  $size -}}
{{- end -}}

{{- define "aws.env" -}}
{{- if hasSuffix "test" .Release.Namespace -}}
{{- print "Dev" -}}
{{- else -}}
{{- print "Prod" -}}
{{- end -}}
{{- end -}}
